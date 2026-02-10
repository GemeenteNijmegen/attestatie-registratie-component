import { assertIssuanceJwtPayload, IssuanceIntentPayload, VeridIssuanceClient } from '@ver-id/node-client';
import { AttestationService, CredentialAttribute } from './AttestationService';

class Cache {
  private store: Record<string, string | null> = {};
  get(key: string) {
    return this.store[key];
  }
  remove(key: string) {
    return this.store[key] = null;
  }
  save(key: string, value: string) {
    return this.store[key] = value;
  }
}

const cache = new Cache();


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
}

export class VerIdAttestationService implements AttestationService {

  private issuanceClient: VeridIssuanceClient;

  constructor(private readonly config: VerIdAttestationServiceConfig, issuanceClient?: VeridIssuanceClient) {
    this.issuanceClient = issuanceClient ?? new VeridIssuanceClient({
      issuerUri: this.config.issuerUri,
      client_id: this.config.client_id,
      redirectUri: this.config.redirectUri,
      // TODO: make this configurable, this is not a production ready implementation
      options: {
        cacheManager: cache,
      },
    });
  }

  async intent(payload: CredentialAttribute[]) {

    const codeChallenge = await this.issuanceClient.generateCodeChallenge();

    // Build intent payload
    const intentPayload: IssuanceIntentPayload = {
      payload: {
        // data: [
        //   { attributeUuid: '1ac22d17-9c8a-493f-8a27-20f89fcec2c1', value: '<First names>' },
        //   { attributeUuid: '3d3e898a-4122-45d8-b42f-4d74c8143116', value: '<Surname>' },
        // ],
        data: payload,
      },
    };

    // Create intent with client authentication
    const intentId = await this.issuanceClient.createIssuanceIntent(
      intentPayload,
      codeChallenge.codeChallenge,
      { client_secret: this.config.client_secret },
    );

    // Generate URL with intent
    const userUrl = await this.issuanceClient.generateIssuanceUrl({
      intent_id: intentId,
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

    const jwt = await this.issuanceClient.decode(finalized, assertIssuanceJwtPayload);
    console.log('JWT', JSON.stringify(jwt.payload.output));
    console.log('Issuing finalized, revocationKey', jwt.payload.output[0].revocationKeys);
    // TODO: implement revocationKeys as response and test it
    // return jwt.payload.output[0].revocationKeys;
  }
}
