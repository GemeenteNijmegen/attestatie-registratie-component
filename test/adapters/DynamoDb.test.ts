import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { DynamoDb } from '../../src/adapters/DynamoDb';
import { StoreNotFoundError } from '../../src/errors';

jest.mock('@aws-sdk/client-dynamodb', () => {
  return {
    DynamoDBClient: jest.fn(),
    PutItemCommand: jest.fn().mockImplementation((input) => ({ input })),
    GetItemCommand: jest.fn().mockImplementation((input) => ({ input })),
    DeleteItemCommand: jest.fn().mockImplementation((input) => ({ input })),
  };
});
jest.mock('@aws-sdk/util-dynamodb');

describe('DynamoDb Adapter', () => {
  let adapter: DynamoDb;
  let mockSend: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    mockSend = jest.fn();
    (DynamoDBClient as jest.Mock).mockImplementation(() => ({
      send: mockSend,
    }));
    (PutItemCommand as jest.Mock).mockImplementation((input) => ({ input }));
    (GetItemCommand as jest.Mock).mockImplementation((input) => ({ input }));
    (DeleteItemCommand as jest.Mock).mockImplementation((input) => ({ input }));

    adapter = new DynamoDb({
      tableName: 'test-table',
      partitionKey: 'id',
    });
  });

  describe('put', () => {
    it('should store a record without TTL by default', async () => {
      const id = 'test-id';
      const payload = { foo: 'bar' };
      const marshalledItem = { id: { S: id }, foo: { S: 'bar' } };

      (marshall as jest.Mock).mockReturnValue(marshalledItem);

      await adapter.put(id, payload);

      expect(marshall).toHaveBeenCalledWith({
        id,
        ...payload,
      });

      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should store a record with TTL when specified', async () => {
      const id = 'test-id';
      const payload = { foo: 'bar' };
      await adapter.put(id, payload, { ttlSeconds: 3600 });

      expect(marshall).toHaveBeenCalledWith({
        id,
        ttl: expect.any(Number),
        ...payload,
      });
    });
  });

  describe('get', () => {
    it('should retrieve and unmarshall a record', async () => {
      const id = 'test-id';
      const marshalledKey = { id: { S: id } };
      const marshalledItem = { id: { S: id }, foo: { S: 'bar' } };
      const unmarshalledItem = { id, foo: 'bar' };

      (marshall as jest.Mock).mockReturnValue(marshalledKey);
      mockSend.mockResolvedValue({ Item: marshalledItem });
      (unmarshall as jest.Mock).mockReturnValue(unmarshalledItem);

      const result = await adapter.get(id);

      expect(mockSend).toHaveBeenCalledTimes(1);
      const command = mockSend.mock.calls[0][0];
      expect(command.input).toEqual({
        TableName: 'test-table',
        Key: marshalledKey,
      });

      expect(unmarshall).toHaveBeenCalledWith(marshalledItem);
      expect(result).toEqual({ foo: 'bar' }); // internal attributes should be removed
    });

    it('should throw StoreNotFoundError if item is not found', async () => {
      const id = 'missing-id';
      mockSend.mockResolvedValue({ Item: undefined });

      await expect(adapter.get(id)).rejects.toThrow(StoreNotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete a record', async () => {
      const id = 'test-id';
      const marshalledKey = { id: { S: id } };
      (marshall as jest.Mock).mockReturnValue(marshalledKey);
      mockSend.mockResolvedValue({});

      await adapter.delete(id);

      expect(mockSend).toHaveBeenCalledTimes(1);
      const command = mockSend.mock.calls[0][0];
      expect(command.input).toEqual({
        TableName: 'test-table',
        Key: marshalledKey,
      });
    });
  });
});
