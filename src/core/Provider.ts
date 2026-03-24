import { AttestationNotConfiguredError } from '../errors';
import { IssuanceEvent, MappingResult, ProviderIssueResult, SessionStatus } from '../schemas';
import { Base } from './Base';
import { Session, SessionContext } from './Session';

export interface ProviderConfig {}

export interface AttestationConfig {}

export interface ProviderOptions<
  TConfig extends ProviderConfig = ProviderConfig,
  TAttestation extends AttestationConfig = AttestationConfig,
> {
  config: TConfig;
  attestations: Record<string, TAttestation>;
}

export abstract class Provider<
  TConfig extends ProviderConfig = ProviderConfig,
  TAttestation extends AttestationConfig = AttestationConfig,
> extends Base {
  protected session?: Session;

  constructor(protected readonly options: ProviderOptions<TConfig, TAttestation>) {
    super();
  }

  setSession(session: Session): void {
    this.session = session;
  }

  protected getAttestationConfig(attestationName: string): TAttestation {
    const config = this.options.attestations[attestationName];
    if (!config) {
      throw new AttestationNotConfiguredError(attestationName);
    }
    return config;
  }

  protected async emitIssuanceEvent(event: IssuanceEvent): Promise<void> {
    await this.emit('issuance', event);
  }

  abstract issue(context: SessionContext, payload: MappingResult): Promise<ProviderIssueResult>;
  abstract status(sessionId: string): Promise<SessionStatus>;
  abstract revoke(sessionId: string): Promise<void>;
}
