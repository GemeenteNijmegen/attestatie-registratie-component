import { InMemory } from '../../src/adapters/InMemory';
import { Session } from '../../src/core/Session';
import { standplaatsvergunningContext } from '../fixtures/sessions';

describe('Session', () => {
  let session: Session;
  let store: InMemory;

  beforeEach(() => {
    store = new InMemory();
    session = new Session({ store });
  });

  describe('save and get', () => {
    it('should store and retrieve session context', async () => {
      await session.save('session-1', standplaatsvergunningContext);
      const result = await session.get('session-1');

      expect(result).toEqual(standplaatsvergunningContext);
    });
  });


  describe('saveCallback and getCallback', () => {
    it('should store and retrieve callback state', async () => {
      await session.saveCallback('state-abc', 'session-1', standplaatsvergunningContext);
      const result = await session.getCallback('state-abc');

      expect(result.sessionId).toBe('session-1');
      expect(result.context).toEqual(standplaatsvergunningContext);
    });

    it('should throw for unknown callback state', async () => {
      await expect(session.getCallback('unknown')).rejects.toThrow('Unknown or expired callback state');
    });

    it('should throw for corrupt callback session', async () => {
      await store.put('callback:corrupt', { foo: 'bar' });
      await expect(session.getCallback('corrupt')).rejects.toThrow('Corrupt callback session');
    });
  });

  describe('deleteCallback', () => {
    it('should remove callback state', async () => {
      await session.saveCallback('state-abc', 'session-1', standplaatsvergunningContext);
      await session.deleteCallback('state-abc');

      await expect(store.get('callback:state-abc')).rejects.toThrow();
    });

    it('should not throw when callback state does not exist', async () => {
      await expect(session.deleteCallback('nonexistent')).resolves.toBeUndefined();
    });
  });

  describe('cleanupCallback', () => {
    it('should remove callback state but keep session', async () => {
      await session.save('session-1', standplaatsvergunningContext);
      await session.saveCallback('state-abc', 'session-1', standplaatsvergunningContext);

      await session.cleanupCallback('state-abc', 'session-1');

      await expect(store.get('callback:state-abc')).rejects.toThrow();
      await expect(store.get('session-1')).resolves.toEqual(standplaatsvergunningContext);
    });
  });
});
