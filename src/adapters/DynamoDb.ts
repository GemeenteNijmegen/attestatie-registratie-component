import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Store, StoreConfig } from '../core/Store';
import { StoreNotFoundError } from '../errors';

export interface DynamoDbConfig extends StoreConfig {
  tableName: string;
  partitionKey?: string;
  ttlAttribute?: string;
}

export class DynamoDb extends Store<DynamoDbConfig> {
  private client: DynamoDBClient;
  private partitionKey: string;
  private ttlAttribute: string;

  constructor(config: DynamoDbConfig) {
    super({ config });
    this.partitionKey = config.partitionKey ?? 'id';
    this.ttlAttribute = config.ttlAttribute ?? 'ttl';
    this.client = new DynamoDBClient();
  }

  async put(id: string, payload: Record<string, string>, options?: { ttlSeconds?: number }): Promise<void> {
    const ttl = options?.ttlSeconds ?? this.defaultTtlSeconds;
    const expiresAt = ttl === 0 ? undefined : Math.floor(Date.now() / 1000) + ttl;

    const item = marshall({
      [this.partitionKey]: id,
      ...(expiresAt ? { [this.ttlAttribute]: expiresAt } : {}),
      ...payload,
    });

    await this.client.send(new PutItemCommand({
      TableName: this.options.config.tableName,
      Item: item,
    }));
  }

  async get(id: string): Promise<Record<string, string>> {
    const response = await this.client.send(new GetItemCommand({
      TableName: this.options.config.tableName,
      Key: marshall({ [this.partitionKey]: id }),
    }));

    if (!response.Item) {
      throw new StoreNotFoundError(id);
    }

    const unmarshalled = unmarshall(response.Item) as Record<string, string>;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [this.partitionKey]: _pk, [this.ttlAttribute]: _ttl, ...rest } = unmarshalled;
    return rest;
  }

  async delete(id: string): Promise<void> {
    await this.client.send(new DeleteItemCommand({
      TableName: this.options.config.tableName,
      Key: marshall({ [this.partitionKey]: id }),
    }));
  }
}
