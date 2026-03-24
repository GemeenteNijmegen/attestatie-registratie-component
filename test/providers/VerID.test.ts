import { VeridIssuanceClient } from '@ver-id/node-client';
import { InMemory } from '../../src/adapters/InMemory';
import { EventListeners } from '../../src/core/Base';
import { Session } from '../../src/core/Session';
import { VerID } from '../../src/providers/VerID';
import { IssuanceEvent } from '../../src/schemas';

function createMockClient(): VeridIssuanceClient {
  return {
    generateCodeChallenge: jest.fn().mockResolvedValue({
      codeChallenge: 'mock-code-challenge',
      state: 'mock-state',
    }),
    createIssuanceIntent: jest.fn().mockResolvedValue({
      intent_id: 'mock-intent-id',
      issuance_run_uuid: 'mock-run-uuid',
    }),
    generateIssuanceUrl: jest.fn().mockResolvedValue({
      issuanceUrl: 'https://verid.example.com/issuance/start',
    }),
  } as unknown as VeridIssuanceClient;
}

describe('VerID', () => {
  let provider: VerID;
  let mockClient: VeridIssuanceClient;
  let store: InMemory;
  let issuanceEvents: IssuanceEvent[];

  beforeEach(() => {
    mockClient = createMockClient();
    store = new InMemory();
    issuanceEvents = [];

    provider = new VerID(
      {
        issuerUri: 'https://verid.example.com',
        redirectUri: 'https://mijn.nijmegen.nl/callback',
        clientSecret: 'test-secret',
      },
      {
        standplaatsvergunning: { flowUuid: 'flow-uuid-standplaats' },
      },
      mockClient,
    );

    const listeners: EventListeners = {};
    provider.init(listeners);
    provider.setSession(new Session({ store }));
    provider.on('issuance', async (event) => { issuanceEvents.push(event); });
  });

  describe('issue', () => {
    it('should create intent and return issuance URL', async () => {
      const result = await provider.issue({ source: 'openproduct', id: 'product-123', attestation: 'standplaatsvergunning' }, { bsn: '999999333' });

      expect(result.type).toBe('oauth');
      expect(result.sessionId).toBe('mock-run-uuid');
      if (result.type === 'oauth') {
        expect(result.url).toBe('https://verid.example.com/issuance/start');
        expect(result.callbackState).toBe('mock-state');
      }
    });

    it('should pass mapping result as payload to Ver.ID client', async () => {
      const mappingResult = { bsn: '999999333', kenmerk: 'abc' };
      await provider.issue({ source: 'openproduct', id: 'product-123', attestation: 'standplaatsvergunning' }, mappingResult);

      expect(mockClient.createIssuanceIntent).toHaveBeenCalledWith(
        { payload: { mapping: mappingResult } },
        'mock-code-challenge',
        { client_secret: 'test-secret' },
      );
    });

    it('should throw for unconfigured attestation', async () => {
      await expect(provider.issue({ source: 'openproduct', id: '123', attestation: 'unknown' }, {})).rejects.toThrow(
        'No configuration for attestation "unknown"',
      );
    });
  });

  describe('callback', () => {
    beforeEach(async () => {
      // Simulate a prior issue() that stored callback state
      await store.put('callback:mock-state', {
        sessionId: 'mock-run-uuid',
        source: 'openproduct',
        id: 'product-123',
        attestation: 'standplaatsvergunning',
      });
    });

    it('should resolve callback state and return success with context', async () => {
      const params = new URLSearchParams({ state: 'mock-state', code: 'auth-code' });
      const result = await provider.callback(params);

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe('mock-run-uuid');
      expect(result.context).toEqual({
        source: 'openproduct',
        id: 'product-123',
        attestation: 'standplaatsvergunning',
      });
    });

    it('should emit session event with issued status on success', async () => {
      const params = new URLSearchParams({ state: 'mock-state', code: 'auth-code' });
      await provider.callback(params);

      expect(issuanceEvents).toHaveLength(1);
      expect(issuanceEvents[0].status).toBe('issued');
      expect(issuanceEvents[0].context.attestation).toBe('standplaatsvergunning');
    });

    it('should emit session event with aborted status on error', async () => {
      const params = new URLSearchParams({ state: 'mock-state', error: 'access_denied' });
      const result = await provider.callback(params);

      expect(result.success).toBe(false);
      expect(issuanceEvents).toHaveLength(1);
      expect(issuanceEvents[0].status).toBe('aborted');
      expect(issuanceEvents[0].sessionId).toBe('mock-run-uuid');
    });

    it('should throw for unknown state', async () => {
      const params = new URLSearchParams({ state: 'unknown-state' });
      await expect(provider.callback(params)).rejects.toThrow('Unknown or expired callback state');
    });

    it('should throw when state parameter is missing', async () => {
      const params = new URLSearchParams({});
      await expect(provider.callback(params)).rejects.toThrow('Missing state parameter');
    });

    it('should cleanup callback state after processing', async () => {
      const params = new URLSearchParams({ state: 'mock-state', code: 'auth-code' });
      await provider.callback(params);

      await expect(store.get('callback:mock-state')).rejects.toThrow();
    });
  });

  describe('status', () => {
    it('should throw not implemented', async () => {
      await expect(provider.status('some-session')).rejects.toThrow('not yet implemented');
    });
  });

  describe('revoke', () => {
    it('should throw not implemented', async () => {
      await expect(provider.revoke('some-session')).rejects.toThrow('not yet implemented');
    });
  });
});
