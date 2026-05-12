import { Store, StoreConfig } from '../core/Store';
import { StoreExpiredError, StoreNotFoundError } from '../errors';

interface StoredItem {
  payload: Record<string, string>;
  expiresAt: number;
}

export interface InMemoryConfig extends StoreConfig {}

export class InMemory extends Store<InMemoryConfig> {
  private data = new Map<string, StoredItem>();

  constructor(config: InMemoryConfig = {}) {
    super({ config });
  }

  async put(id: string, payload: Record<string, string>, options?: { ttlSeconds?: number }): Promise<void> {
    const ttl = options?.ttlSeconds ?? this.defaultTtlSeconds;
    this.data.set(id, {
      payload,
      expiresAt: ttl === 0 ? Infinity : Date.now() + ttl * 1000,
    });
  }

  async get(id: string): Promise<Record<string, string>> {
    const item = this.data.get(id);
    if (!item) {
      throw new StoreNotFoundError(id);
    }
    if (Date.now() > item.expiresAt) {
      this.data.delete(id);
      throw new StoreExpiredError(id);
    }
    return item.payload;
  }

  async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
