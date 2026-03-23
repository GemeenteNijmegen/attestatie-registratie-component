import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBStateStore } from '../DynamoDbStateStore';

const ddbMock = mockClient(DynamoDBClient);

describe('DynamoDBStateStore', () => {
  let store: DynamoDBStateStore;

  beforeEach(() => {
    ddbMock.reset();
    store = new DynamoDBStateStore('test-table', {
      region: 'eu-west-1',
      partitionKey: 'id',
    });
  });

  describe('put()', () => {
    it('sends a PutItemCommand with the correct table and item', async () => {
      ddbMock.on(PutItemCommand).resolves({});

      await store.put('session-123', {
        userId: 'user-456',
        status: 'active',
      });

      const calls = ddbMock.commandCalls(PutItemCommand);
      expect(calls).toHaveLength(1);

      const input = calls[0].args[0].input;
      expect(input.TableName).toBe('test-table');
      expect(input.Item).toEqual(
        marshall({
          id: 'session-123',
          userId: 'user-456',
          status: 'active',
        }),
      );
    });

    it('returns the DynamoDB response', async () => {
      const mockResponse = { $metadata: { httpStatusCode: 200 } };
      ddbMock.on(PutItemCommand).resolves(mockResponse);

      const result = await store.put('session-123', { status: 'active' });

      expect(result).toEqual(mockResponse);
    });

    it('propagates errors from DynamoDB', async () => {
      ddbMock.on(PutItemCommand).rejects(new Error('DynamoDB unavailable'));

      await expect(
        store.put('session-123', { status: 'active' }),
      ).rejects.toThrow('DynamoDB unavailable');
    });
  });

  describe('get()', () => {
    it('returns the item without the partition key', async () => {
      ddbMock.on(GetItemCommand).resolves({
        Item: marshall({
          id: 'session-123',
          userId: 'user-456',
          status: 'active',
        }),
      });

      const result = await store.get('session-123');

      expect(result).toEqual({
        userId: 'user-456',
        status: 'active',
      });
      expect(result).not.toHaveProperty('id');
    });

    it('sends a GetItemCommand with the correct key', async () => {
      ddbMock.on(GetItemCommand).resolves({
        Item: marshall({ id: 'session-123', status: 'active' }),
      });

      await store.get('session-123');

      const calls = ddbMock.commandCalls(GetItemCommand);
      expect(calls).toHaveLength(1);

      const input = calls[0].args[0].input;
      expect(input.TableName).toBe('test-table');
      expect(input.Key).toEqual(marshall({ id: 'session-123' }));
    });

    it('throws when item is not found', async () => {
      ddbMock.on(GetItemCommand).resolves({ Item: undefined });

      await expect(store.get('nonexistent-id')).rejects.toThrow(
        'Item with id "nonexistent-id" not found',
      );
    });

    it('propagates errors from DynamoDB', async () => {
      ddbMock.on(GetItemCommand).rejects(new Error('DynamoDB unavailable'));

      await expect(store.get('session-123')).rejects.toThrow(
        'DynamoDB unavailable',
      );
    });
  });
});
