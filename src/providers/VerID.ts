import { ICacheManager, IssuanceIntentPayload, VeridIssuanceClient } from '@ver-id/node-client';
import { Provider, ProviderConfig, AttestationConfig } from '../core/Provider';
import { MappingResult, ProviderIssueResult, SessionStatus } from '../schemas';

export interface VerIDConfig extends ProviderConfig {
  issuerUri: string;
  redirectUri: string;
  clientSecret: string;
  cacheManager?: ICacheManager;
}

export interface VerIDAttestationConfig extends AttestationConfig {
  flowUuid: string;
}

export class VerID extends Provider<VerIDConfig, VerIDAttestationConfig> {
  constructor(
    config: VerIDConfig,
    attestations: Record<string, VerIDAttestationConfig>,
    private readonly testClient?: VeridIssuanceClient,
  ) {
    super({ config, attestations });
  }

  private getClient(flowUuid: string): VeridIssuanceClient {
    return this.testClient ?? new VeridIssuanceClient({
      issuerUri: this.options.config.issuerUri,
      client_id: flowUuid,
      redirectUri: this.options.config.redirectUri,
      options: {
        cacheManager: this.options.config.cacheManager,
      },
    });
  }

  async issue(attestationName: string, mappingResult: MappingResult): Promise<ProviderIssueResult> {
    const attestationConfig = this.getAttestationConfig(attestationName);
    const client = this.getClient(attestationConfig.flowUuid);
    const codeChallenge = await client.generateCodeChallenge();

    const intentPayload: IssuanceIntentPayload = {
      payload: {
        mapping: mappingResult,
      },
    };

    const intent = await client.createIssuanceIntent(
      intentPayload,
      codeChallenge.codeChallenge,
      { client_secret: this.options.config.clientSecret },
    );

    const userUrl = await client.generateIssuanceUrl({
      intent_id: intent.intent_id,
      state: codeChallenge.state,
      codeChallenge: codeChallenge.codeChallenge,
    });

    return {
      url: userUrl.issuanceUrl,
      sessionId: intent.issuance_run_uuid!,
      callbackState: codeChallenge.state,
    };
  }

  async status(_: string): Promise<SessionStatus> {
    // TODO: call Ver.ID API to get issuance run status
    throw new Error('Status check not yet implemented');
  }

  async revoke(_: string): Promise<void> {
    // TODO: call Ver.ID API to revoke issuance run
    throw new Error('Revocation not yet implemented');
  }

  async callback(searchParams: URLSearchParams): Promise<VerIDCallbackResult> {
    if (!this.session) {
      throw new Error('Session not configured — provider must be initialized via ARC');
    }

    const state = searchParams.get('state');
    if (!state) throw new Error('Missing state parameter in callback');

    const { sessionId, context } = await this.session.getCallback(state);

    const hasError = Array.from(searchParams.keys()).some(k => k.toLowerCase().includes('error'));
    const success = !hasError;

    // TODO: implement finalize flow when success
    // const attestationConfig = this.getAttestationConfig(context.attestation);
    // const client = this.getClient(attestationConfig.flowUuid);
    // const finalized = await client.finalize({ ... });

    if (success) {
      await this.emitSessionEvent({
        sessionId,
        status: 'issued',
        context,
      });
    }

    await this.session.cleanupCallback(state, sessionId);

    return { success, sessionId };
  }
}

export interface VerIDCallbackResult {
  success: boolean;
  sessionId: string;
}
