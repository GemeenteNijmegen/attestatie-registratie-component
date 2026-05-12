import { CallbackStateCorruptError, CallbackStateNotFoundError } from '../errors';
import { Store } from './Store';

export interface SessionContext {
  source: string;
  id: string;
  attestation: string;
}

export interface SessionOptions {
  store: Store<any>;
}

export class Session {
  constructor(private readonly options: SessionOptions) { }

  async save(sessionId: string, context: SessionContext): Promise<void> {
    await this.options.store.put(sessionId, {
      source: context.source,
      id: context.id,
      attestation: context.attestation,
    });
  }

  async get(sessionId: string): Promise<SessionContext> {
    const record = await this.options.store.get(sessionId);
    return {
      source: record.source ?? '',
      id: record.id ?? '',
      attestation: record.attestation ?? '',
    };
  }

  async saveCallback(state: string, sessionId: string, context: SessionContext): Promise<void> {
    await this.options.store.put(`callback:${state}`, {
      sessionId,
      source: context.source,
      id: context.id,
      attestation: context.attestation,
    });
  }

  async getCallback(state: string): Promise<{ sessionId: string; context: SessionContext }> {
    let record: Record<string, string>;
    try {
      record = await this.options.store.get(`callback:${state}`);
    } catch {
      throw new CallbackStateNotFoundError(state);
    }

    if (!record.sessionId || !record.attestation) {
      throw new CallbackStateCorruptError(state);
    }

    return {
      sessionId: record.sessionId,
      context: {
        source: record.source ?? '',
        id: record.id ?? '',
        attestation: record.attestation,
      },
    };
  }

  async deleteCallback(state: string): Promise<void> {
    try {
      await this.options.store.delete(`callback:${state}`);
    } catch {
      // Store record may have already been deleted
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async cleanupCallback(state: string, _sessionId: string): Promise<void> {
    await this.deleteCallback(state);
  }
}
