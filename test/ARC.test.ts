import { InMemory } from '../src/adapters/InMemory';
import { ARC } from '../src/ARC';
import { OpenProductStandplaatsvergunning } from '../src/attestations/openproduct/OpenProductStandplaatsvergunning';
import { IssuanceEvent } from '../src/schemas';
import { validProduct } from './fixtures/products';
import { MockProvider } from './mocks/MockProvider';
import { MockSource } from './mocks/MockSource';
import { Product } from '../src/sources/OpenProduct';

describe('ARC', () => {
  let source: MockSource<Product>;
  let provider: MockProvider;
  let store: InMemory;
  let issuanceEvents: IssuanceEvent[];

  function createARC() {
    const arc = new ARC({
      provider,
      store,
      sources: [source],
      attestations: [new OpenProductStandplaatsvergunning()],
    });
    arc.on('issuance', async (event) => {
      issuanceEvents.push(event);
    });
    return arc;
  }

  beforeEach(() => {
    source = new MockSource<Product>('openproduct');
    source.addData(validProduct.uuid, validProduct);
    provider = new MockProvider();
    store = new InMemory();
    issuanceEvents = [];
  });

  describe('constructor', () => {
    it('should validate that attestations reference registered sources', () => {
      const badSource = new MockSource('wrong-source');
      expect(() => new ARC({
        provider,
        store,
        sources: [badSource],
        attestations: [new OpenProductStandplaatsvergunning()],
      })).toThrow('Attestation "standplaatsvergunning" references unknown source "openproduct"');
    });
  });

  describe('issue', () => {
    it('should fetch source data, map it, and call provider', async () => {
      const arc = createARC();

      const result = await arc.issue({
        source: 'openproduct',
        id: validProduct.uuid,
      });

      expect(result.type).toBe('oauth');
      expect(result.sessionId).toBe('mock-session-id');
      if (result.type === 'oauth') {
        expect(result.url).toBe('https://verid.example.com/issuance/mock');
        expect(result.callbackState).toBe('mock-state');
      }
      expect(source.fetchCalls).toEqual([validProduct.uuid]);
      expect(provider.issueCalls).toHaveLength(1);
      expect(provider.issueCalls[0].attestationName).toBe('standplaatsvergunning');
      expect(provider.issueCalls[0].payload).toHaveProperty('bsn', '999999333');
    });

    it('should fire issuance event with pending status', async () => {
      const arc = createARC();

      await arc.issue({
        source: 'openproduct',
        id: validProduct.uuid,
      });

      expect(issuanceEvents).toHaveLength(1);
      expect(issuanceEvents[0].status).toBe('pending');
      expect(issuanceEvents[0].sessionId).toBe('mock-session-id');
      expect(issuanceEvents[0].context).toEqual({
        source: 'openproduct',
        id: validProduct.uuid,
        attestation: 'standplaatsvergunning',
      });
    });

    it('should store session and callback state', async () => {
      const arc = createARC();

      await arc.issue({
        source: 'openproduct',
        id: validProduct.uuid,
      });

      const session = await store.get('mock-session-id');
      expect(session.attestation).toBe('standplaatsvergunning');
      expect(session.source).toBe('openproduct');

      const callbackState = await store.get('callback:mock-state');
      expect(callbackState.sessionId).toBe('mock-session-id');
    });

    it('should throw for unknown source', async () => {
      const arc = createARC();

      await expect(arc.issue({
        source: 'unknown',
        id: '123',
      })).rejects.toThrow('Unknown source: unknown');
    });

    it('should throw when no attestation matches source data', async () => {
      const unmatchedProduct = { ...validProduct, producttype: { ...validProduct.producttype, uniforme_product_naam: 'unknown' } };
      source.addData('unmatched-id', unmatchedProduct);
      const arc = createARC();

      await expect(arc.issue({
        source: 'openproduct',
        id: 'unmatched-id',
      })).rejects.toThrow('No matching attestation found for source "openproduct"');
    });

    it('should not fail if event handler throws', async () => {
      const arc = new ARC({
        provider,
        store,
        sources: [source],
        attestations: [new OpenProductStandplaatsvergunning()],
      });
      arc.on('issuance', async () => { throw new Error('handler failed'); });

      const result = await arc.issue({
        source: 'openproduct',
        id: validProduct.uuid,
      });

      expect(result.sessionId).toBe('mock-session-id');
    });
  });

  describe('status', () => {
    it('should delegate to provider', async () => {
      const arc = createARC();
      provider.setNextStatus('issued');

      const result = await arc.status({ sessionId: 'some-session' });

      expect(result.sessionId).toBe('some-session');
      expect(result.status).toBe('issued');
      expect(provider.statusCalls).toEqual(['some-session']);
    });
  });

  describe('revoke', () => {
    it('should delegate to provider', async () => {
      const arc = createARC();

      const result = await arc.revoke({ sessionId: 'mock-session-id' });

      expect(result.sessionId).toBe('mock-session-id');
      expect(provider.revokeCalls).toEqual([{ sessionId: 'mock-session-id' }]);
    });
  });
});
