import { newDb } from 'pg-mem';
import { PostgreSql } from '../../src/adapters/PostgreSql';
import { Session } from '../../src/core/Session';
import { StoreExpiredError, StoreNotFoundError } from '../../src/errors';
import { overlijdensakteContext, standplaatsvergunningContext } from '../fixtures/sessions';

describe('PostgreSql Adapter', () => {
  let adapter: PostgreSql;
  let pool: any;

  beforeEach(async () => {
    const db = newDb();
    // pg-mem supports JSONB and most PG features
    const { Pool } = db.adapters.createPg();
    pool = new Pool();
    adapter = new PostgreSql({ pool });
  });

  afterEach(async () => {
    await pool.end();
  });

  it('should store and retrieve data', async () => {
    const id = 'test-id';
    const payload = standplaatsvergunningContext as any;

    await adapter.put(id, payload);
    const retrieved = await adapter.get(id);

    expect(retrieved).toEqual(payload);
  });

  it('should handle updates (upsert)', async () => {
    const id = 'test-id';
    await adapter.put(id, { version: '1' });
    await adapter.put(id, { version: '2' });

    const retrieved = await adapter.get(id);
    expect(retrieved).toEqual({ version: '2' });
  });

  it('should throw StoreNotFoundError for missing records', async () => {
    await expect(adapter.get('non-existent')).rejects.toThrow(StoreNotFoundError);
  });

  it('should delete records', async () => {
    const id = 'test-delete';
    await adapter.put(id, standplaatsvergunningContext as any);
    await adapter.delete(id);

    await expect(adapter.get(id)).rejects.toThrow(StoreNotFoundError);
  });

  it('should store expires_at in the database', async () => {
    const id = 'test-schema';
    const payload = standplaatsvergunningContext as any;
    await adapter.put(id, payload, { ttlSeconds: 3600 });

    const result = await pool.query('SELECT expires_at FROM arc_store WHERE id = $1', [id]);
    expect(result.rows[0].expires_at).toBeInstanceOf(Date);
  });

  it('should handle TTL and expiration', async () => {
    const id = 'test-ttl';
    const payload = standplaatsvergunningContext as any;

    // Set TTL to 1 second
    await adapter.put(id, payload, { ttlSeconds: 1 });

    // Should still be there immediately
    expect(await adapter.get(id)).toEqual(payload);

    // Manually update expires_at to the past to simulate expiration
    await pool.query(`UPDATE ${adapter.tableName} SET expires_at = $1 WHERE id = $2`, [new Date(Date.now() - 1000), id]);

    await expect(adapter.get(id)).rejects.toThrow(StoreExpiredError);
  });

  describe('Integration with Session', () => {
    let session: Session;

    beforeEach(() => {
      session = new Session({ store: adapter });
    });

    it('should work with UUID session IDs and realistic payloads', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const context = overlijdensakteContext;

      await session.save(sessionId, context);
      const retrieved = await session.get(sessionId);

      expect(retrieved).toEqual(context);
    });

    it('should handle callback states with UUIDs', async () => {
      const state = 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6';
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const context = standplaatsvergunningContext;

      await session.saveCallback(state, sessionId, context);
      const retrieved = await session.getCallback(state);

      expect(retrieved.sessionId).toBe(sessionId);
      expect(retrieved.context).toEqual(context);
    });
  });

});
