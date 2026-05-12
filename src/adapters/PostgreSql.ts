import { Pool } from 'pg';
import { Store, StoreConfig } from '../core/Store';
import { StoreExpiredError, StoreNotFoundError } from '../errors';

export interface PostgreSqlConfig extends StoreConfig {
  /**
   * PostgreSQL pool instance
   */
  pool: Pool;
  /**
   * Name of the table to use for storage (default: arc_store)
   */
  tableName?: string;
}

/**
 * PostgreSQL adapter for ARC session storage.
 *
 * Expects a table with the following schema (created automatically during init):
 * CREATE TABLE IF NOT EXISTS arc_store (
 *   id TEXT PRIMARY KEY,
 *   payload JSONB NOT NULL,
 *   expires_at TIMESTAMP
 * );
 */
export class PostgreSql extends Store<PostgreSqlConfig> {
  private tableName: string;
  private initialized: Promise<void>;

  constructor(config: PostgreSqlConfig) {
    super({ config });
    this.tableName = config.tableName ?? 'arc_store';
    this.initialized = this.initTable();
  }

  /**
   * Initializes the database table if it doesn't exist.
   */
  private async initTable(): Promise<void> {
    try {
      await this.options.config.pool.query(`
        CREATE TABLE IF NOT EXISTS ${this.tableName} (
          id TEXT PRIMARY KEY,
          payload JSONB NOT NULL,
          expires_at TIMESTAMP
        )
      `);
    } catch (error) {
      console.error(`Failed to initialize PostgreSQL table ${this.tableName}:`, error);
      throw error;
    }
  }

  async put(id: string, payload: Record<string, string>, options?: { ttlSeconds?: number }): Promise<void> {
    await this.initialized;
    const ttl = options?.ttlSeconds ?? this.defaultTtlSeconds;
    const expiresAt = ttl > 0 ? new Date(Date.now() + ttl * 1000) : null;

    await this.options.config.pool.query(`
      INSERT INTO ${this.tableName} (id, payload, expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO UPDATE SET
        payload = EXCLUDED.payload,
        expires_at = EXCLUDED.expires_at
    `, [id, JSON.stringify(payload), expiresAt]);
  }

  async get(id: string): Promise<Record<string, string>> {
    await this.initialized;
    const result = await this.options.config.pool.query(`
      SELECT payload, expires_at FROM ${this.tableName} WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      throw new StoreNotFoundError(id);
    }

    const { payload, expires_at } = result.rows[0];

    if (expires_at && new Date() > expires_at) {
      await this.delete(id);
      throw new StoreExpiredError(id);
    }

    return payload;
  }

  async delete(id: string): Promise<void> {
    await this.initialized;
    await this.options.config.pool.query(`DELETE FROM ${this.tableName} WHERE id = $1`, [id]);
  }
}
