import { Base } from './Base';

export interface StoreConfig {
  defaultTtlSeconds?: number;
}

export interface StoreOptions<TConfig extends StoreConfig = StoreConfig> {
  config: TConfig;
}

export abstract class Store<TConfig extends StoreConfig = StoreConfig> extends Base {
  constructor(protected readonly options: StoreOptions<TConfig>) {
    super();
  }

  protected get defaultTtlSeconds(): number {
    return this.options.config.defaultTtlSeconds ?? 3600;
  }

  abstract put(id: string, payload: Record<string, string>, options?: { ttlSeconds?: number }): Promise<void>;
  abstract get(id: string): Promise<Record<string, string>>;
  abstract delete(id: string): Promise<void>;
}
