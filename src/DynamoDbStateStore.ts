import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

export interface StateStore {
  put(id: string, payload: Record<string, string>): Promise<any>;
  get(id: string): Promise<Record<string, string>>;
}

export class DynamoDBStateStore implements StateStore {
  private client: DynamoDBClient;
  private tableName: string;
  private partitionKey: string;

  constructor(
    tableName: string,
    options?: {
      partitionKey?: string;
      region?: string;
      endpoint?: string; // useful for local development (e.g. LocalStack)
    },
  ) {
    this.tableName = tableName;
    this.partitionKey = options?.partitionKey ?? 'id';
    this.client = new DynamoDBClient({
      region: options?.region ?? 'eu-west-1',
      ...(options?.endpoint && { endpoint: options.endpoint }),
    });
  }

  async put(id: string, payload: Record<string, string>): Promise<any> {
    const item = marshall({
      [this.partitionKey]: id,
      ...payload,
    });

    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: item,
    });

    return this.client.send(command);
  }

  async get(id: string): Promise<Record<string, string>> {
    const command = new GetItemCommand({
      TableName: this.tableName,
      Key: marshall({ [this.partitionKey]: id }),
    });

    const response = await this.client.send(command);

    if (!response.Item) {
      throw new Error(`Item with id "${id}" not found`);
    }

    const unmarshalled = unmarshall(response.Item) as Record<string, string>;

    // Remove the partition key from the returned payload
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [this.partitionKey]: _, ...rest } = unmarshalled;
    return rest;
  }
}
