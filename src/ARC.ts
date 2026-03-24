import { Attestation } from './core/Attestation';
import { Base, EventListeners } from './core/Base';
import { Provider } from './core/Provider';
import { Session } from './core/Session';
import { Source } from './core/Source';
import { Store } from './core/Store';
import { ConfigurationError, UnknownAttestationError, UnknownSourceError } from './errors';
import { resolveByPath } from './utils/resolveByPath';
import {
  IssueParams, IssueParamsSchema, IssueResult,
  RevokeParams, RevokeParamsSchema, RevokeResult,
  StatusParams, StatusParamsSchema, StatusResult,
} from './schemas';

export interface ARCOptions<TProvider extends Provider<any, any> = Provider> {
  provider: TProvider;
  store: Store<any>;
  sources: Source<any, any>[];
  attestations: Attestation[];
}

export class ARC<TProvider extends Provider<any, any> = Provider> extends Base {
  readonly provider: TProvider;

  private sourceMap: Map<string, Source<any, any>>;
  private attestationsBySource: Map<string, Attestation[]>;
  private session: Session;

  constructor(private readonly options: ARCOptions<TProvider>) {
    super();

    const listeners: EventListeners = {};
    this.init(listeners);

    this.provider = options.provider;
    this.session = new Session({ store: options.store });
    this.sourceMap = new Map(options.sources.map(s => [s.name, s]));
    this.attestationsBySource = new Map();
    for (const attestation of options.attestations) {
      if (!this.sourceMap.has(attestation.sourceName)) {
        throw new ConfigurationError(`Attestation "${attestation.name}" references unknown source "${attestation.sourceName}"`);
      }
      const list = this.attestationsBySource.get(attestation.sourceName) ?? [];
      list.push(attestation);
      this.attestationsBySource.set(attestation.sourceName, list);
    }

    this.provider.init(listeners);
    this.provider.setSession(this.session);
    for (const source of options.sources) {
      source.init(listeners);
    }
    options.store.init(listeners);
  }

  async issue(params: IssueParams): Promise<IssueResult> {
    const validated = IssueParamsSchema.parse(params);

    const source = this.sourceMap.get(validated.source);
    if (!source) throw new UnknownSourceError(validated.source);

    const sourceData = await source.fetch(validated.id);

    const attestation = this.resolveAttestation(validated.source, sourceData);

    const context = { source: validated.source, id: validated.id, attestation: attestation.name };

    const mappingResult = attestation.map(sourceData);
    const providerResult = await this.options.provider.issue(context, mappingResult);

    await this.session.save(providerResult.sessionId, context);

    if (providerResult.type === 'oauth') {
      await this.session.saveCallback(providerResult.callbackState, providerResult.sessionId, context);
    }

    return providerResult;
  }

  private resolveAttestation(sourceName: string, sourceData: unknown): Attestation {
    const attestations = this.attestationsBySource.get(sourceName) ?? [];
    for (const attestation of attestations) {
      const value = resolveByPath(sourceData, attestation.sourceIdentifierPath);
      if (value === attestation.sourceIdentifier) {
        return attestation;
      }
    }
    throw new UnknownAttestationError(sourceName);
  }

  async status(params: StatusParams): Promise<StatusResult> {
    const validated = StatusParamsSchema.parse(params);
    const status = await this.options.provider.status(validated.sessionId);
    return { sessionId: validated.sessionId, status };
  }

  async revoke(params: RevokeParams): Promise<RevokeResult> {
    const validated = RevokeParamsSchema.parse(params);
    await this.options.provider.revoke(validated.sessionId);
    return { sessionId: validated.sessionId };
  }
}
