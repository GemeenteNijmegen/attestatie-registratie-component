import { Pool } from 'pg';
import { Store, StoreConfig } from '../core/Store';
import { StoreExpiredError, StoreNotFoundError } from '../errors';

export interface PostgreSqlConfig extends StoreConfig {
  /**
   * PostgreSQL pool instance
   */
  pool: Pool;
  /**
   * Name of the table to use for session storage (default: arc_sessions)
   */
  sessionTableName?: string;
  /**
   * Name of the table to use for callback storage (default: arc_callbacks)
   */
  callbackTableName?: string;
  /**
   * @deprecated use sessionTableName instead
   */
  tableName?: string;
}

/**
 * PostgreSQL adapter for ARC storage.
 *
 * Uses two tables (created automatically during init):
 * - arc_sessions: for session data
 * - arc_callbacks: for callback state
 */
export class PostgreSql extends Store<PostgreSqlConfig> {
  public readonly sessionTableName: string;
  public readonly callbackTableName: string;
  private initialized: Promise<void>;

  constructor(config: PostgreSqlConfig) {
    super({ config });
    this.sessionTableName = config.sessionTableName ?? config.tableName ?? 'arc_sessions';
    this.callbackTableName = config.callbackTableName ?? 'arc_callbacks';
    this.initialized = this.initTables();
  }

  /**
   * Initializes the database tables if they don't exist.
   */
  private async initTables(): Promise<void> {
    try {
      await this.options.config.pool.query(`
        CREATE TABLE IF NOT EXISTS ${this.sessionTableName} (
          id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL,
          source TEXT NOT NULL,
          attestation TEXT NOT NULL,
          expires_at TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS ${this.callbackTableName} (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          product_id TEXT NOT NULL,
          source TEXT NOT NULL,
          attestation TEXT NOT NULL,
          expires_at TIMESTAMP
        );
      `);
    } catch (error) {
      console.error('Failed to initialize PostgreSQL tables:', error);
      throw error;
    }
  }

  private getTableName(id: string): string {
    return id.startsWith('callback:') ? this.callbackTableName : this.sessionTableName;
  }

  async put(id: string, payload: Record<string, string>, options?: { ttlSeconds?: number }): Promise<void> {
    await this.initialized;
    const ttl = options?.ttlSeconds ?? this.defaultTtlSeconds;
    const expiresAt = ttl > 0 ? new Date(Date.now() + ttl * 1000) : null;
    const tableName = this.getTableName(id);

    if (tableName === this.callbackTableName) {
      await this.options.config.pool.query(`
        INSERT INTO ${tableName} (id, session_id, product_id, source, attestation, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          session_id = EXCLUDED.session_id,
          product_id = EXCLUDED.product_id,
          source = EXCLUDED.source,
          attestation = EXCLUDED.attestation,
          expires_at = EXCLUDED.expires_at
      `, [id, payload.sessionId, payload.id, payload.source, payload.attestation, expiresAt]);
    } else {
      await this.options.config.pool.query(`
        INSERT INTO ${tableName} (id, product_id, source, attestation, expires_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          product_id = EXCLUDED.product_id,
          source = EXCLUDED.source,
          attestation = EXCLUDED.attestation,
          expires_at = EXCLUDED.expires_at
      `, [id, payload.id, payload.source, payload.attestation, expiresAt]);
    }
  }

  async get(id: string): Promise<Record<string, string>> {
    await this.initialized;
    const tableName = this.getTableName(id);
    const result = await this.options.config.pool.query(`
      SELECT * FROM ${tableName} WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      throw new StoreNotFoundError(id);
    }

    const { product_id, source, attestation, expires_at, session_id } = result.rows[0];

    if (expires_at && new Date() > expires_at) {
      await this.delete(id);
      throw new StoreExpiredError(id);
    }

    const payload: Record<string, string> = {
      id: product_id,
      source,
      attestation,
    };

    if (session_id) {
      payload.sessionId = session_id;
    }

    return payload;
  }

  async delete(id: string): Promise<void> {
    await this.initialized;
    const tableName = this.getTableName(id);
    await this.options.config.pool.query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);
  }
}
