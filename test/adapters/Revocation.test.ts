import { InMemory } from '../../src/adapters/InMemory';
import { ARC } from '../../src/ARC';
import { OpenProductStandplaatsvergunning } from '../../src/attestations/openproduct/OpenProductStandplaatsvergunning';
import { Product } from '../../src/sources/OpenProduct';
import { validProduct } from '../fixtures/products';
import { MockProvider } from '../mocks/MockProvider';
import { MockSource } from '../mocks/MockSource';

describe('Revocation Flow', () => {
  let source: MockSource<Product>;
  let provider: MockProvider;
  let store: InMemory;

  function createARC() {
    return new ARC({
      provider,
      store,
      sources: [source],
      attestations: [new OpenProductStandplaatsvergunning()],
    });
  }

  beforeEach(() => {
    source = new MockSource<Product>('openproduct');
    source.addData(validProduct.uuid, validProduct);
    provider = new MockProvider();
    store = new InMemory();
  });

  it('should store the session permanently during issuance and allow revocation', async () => {
    const arc = createARC();

    // 1. Issue an attestation
    const issueResult = await arc.issue({
      source: 'openproduct',
      id: validProduct.uuid,
    });

    const sessionId = issueResult.sessionId;
    expect(sessionId).toBe('mock-session-id');

    // 2. Verify it's in the store
    const sessionRecord = await store.get(sessionId);
    expect(sessionRecord.source).toBe('openproduct');
    expect(sessionRecord.id).toBe(validProduct.uuid);

    // 3. Revoke using the sessionId
    const revokeResult = await arc.revoke({
      sessionId,
    });

    expect(revokeResult.sessionId).toBe(sessionId);
    expect(provider.revokeCalls).toContainEqual({ sessionId });
  });

  it('should allow revocation even if the session was created long ago (simulated)', async () => {
    const arc = createARC();

    // 1. Issue
    const issueResult = await arc.issue({
      source: 'openproduct',
      id: validProduct.uuid,
    });

    // 2. Simulate time passing (InMemory store uses Infinity for ttl: 0, so it should stay)
    // We don't actually need to wait, but we can verify it's still there
    const record = await store.get(issueResult.sessionId);
    expect(record).toBeDefined();

    // 3. Revoke
    await arc.revoke({ sessionId: issueResult.sessionId });
    expect(provider.revokeCalls).toHaveLength(1);
  });
});
