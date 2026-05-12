import { InMemory } from '../../src/adapters/InMemory';

describe('InMemory', () => {
  let store: InMemory;

  beforeEach(() => {
    store = new InMemory();
  });

  describe('put and get', () => {
    it('should store and retrieve a record', async () => {
      await store.put('key-1', { foo: 'bar' });
      const result = await store.get('key-1');
      expect(result).toEqual({ foo: 'bar' });
    });

    it('should overwrite existing records', async () => {
      await store.put('key-1', { version: '1' });
      await store.put('key-1', { version: '2' });
      const result = await store.get('key-1');
      expect(result).toEqual({ version: '2' });
    });
  });

  describe('get', () => {
    it('should throw for non-existent key', async () => {
      await expect(store.get('missing')).rejects.toThrow('Item with id "missing" not found');
    });
  });

  describe('delete', () => {
    it('should remove a record', async () => {
      await store.put('key-1', { foo: 'bar' });
      await store.delete('key-1');
      await expect(store.get('key-1')).rejects.toThrow();
    });

    it('should not throw when deleting non-existent key', async () => {
      await expect(store.delete('missing')).resolves.toBeUndefined();
    });
  });

  describe('TTL', () => {
    it('should use default TTL of 0 (infinite)', async () => {
      const defaultStore = new InMemory();
      await defaultStore.put('key-1', { foo: 'bar' });

      jest.useFakeTimers();
      jest.advanceTimersByTime(1000 * 60 * 60 * 24 * 365); // 1 year

      const result = await defaultStore.get('key-1');
      expect(result).toEqual({ foo: 'bar' });
      jest.useRealTimers();
    });

    it('should accept custom TTL', () => {
      const customStore = new InMemory({ defaultTtlSeconds: 60 });
      expect(customStore).toBeDefined();
    });

    it('should expire records after TTL', async () => {
      const shortTtlStore = new InMemory({ defaultTtlSeconds: 1 });
      await shortTtlStore.put('key-1', { foo: 'bar' });

      // Record should be readable immediately
      const result = await shortTtlStore.get('key-1');
      expect(result).toEqual({ foo: 'bar' });

      // Fast-forward time
      jest.useFakeTimers();
      jest.advanceTimersByTime(2000);

      await expect(shortTtlStore.get('key-1')).rejects.toThrow('has expired');

      jest.useRealTimers();
    });

    it('should allow per-write TTL override', async () => {
      await store.put('short-lived', { foo: 'bar' }, { ttlSeconds: 1 });

      const result = await store.get('short-lived');
      expect(result).toEqual({ foo: 'bar' });

      jest.useFakeTimers();
      jest.advanceTimersByTime(2000);

      await expect(store.get('short-lived')).rejects.toThrow('has expired');

      jest.useRealTimers();
    });
  });
});
