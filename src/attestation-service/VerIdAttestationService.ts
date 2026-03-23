import { assertIssuanceV1JwtPayload, ICacheManager, IssuanceIntentPayload, VeridIssuanceClient } from '@ver-id/node-client';
import { AttestationService, CredentialAttribute } from './AttestationService';


export interface VerIdAttestationServiceConfig {
  /**
   * VerID url?
   */
  issuerUri: string;
  /**
   * Probably mijn.nijmgen.nl
   */
  redirectUri: string;
  /**
   * Client id
   */
  client_id: string;
  /**
   * Client secret
   */
  client_secret: string;
  /**
   * Cache manager
   */
  cacheManager?: ICacheManager;
}

export class VerIdAttestationService implements AttestationService {

  private issuanceClient: VeridIssuanceClient;

  constructor(private readonly config: VerIdAttestationServiceConfig, issuanceClient?: VeridIssuanceClient) {
    this.issuanceClient = issuanceClient ?? new VeridIssuanceClient({
      issuerUri: this.config.issuerUri,
      client_id: this.config.client_id,
      redirectUri: this.config.redirectUri,
      options: {
        cacheManager: this.config.cacheManager,
      },
    });
  }

  async intent(payload: CredentialAttribute[]) {

    const codeChallenge = await this.issuanceClient.generateCodeChallenge();

    // Build intent payload
    const intentPayload: IssuanceIntentPayload = {
      payload: {
        data: payload,
      },
    };

    // Create intent with client authentication
    const intent = await this.issuanceClient.createIssuanceIntent(
      intentPayload,
      codeChallenge.codeChallenge,
      { client_secret: this.config.client_secret },
    );

    console.log('TODO: Save this somewhere safe', intent.issuance_run_uuid);

    // Generate URL with intent
    const userUrl = await this.issuanceClient.generateIssuanceUrl({
      intent_id: intent.intent_id,
      state: codeChallenge.state,
      codeChallenge: codeChallenge.codeChallenge,
    });

    return userUrl.issuanceUrl;
  }

  async authorize(params: URLSearchParams) {
    const finalized = await this.issuanceClient.finalize({
      callbackParams: params,
      clientAuth: {
        client_secret: this.config.client_secret,
      },
    });

    const jwt = await this.issuanceClient.decode(finalized, assertIssuanceV1JwtPayload);
    console.log('JWT', JSON.stringify(jwt.payload.output));

    // TODO: implement revocationKeys as response and test it
    // return jwt.payload.output[0].revocationKeys;
  }
}
