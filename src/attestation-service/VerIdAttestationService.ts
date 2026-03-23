import { ICacheManager, IssuanceIntentPayload, VeridIssuanceClient } from '@ver-id/node-client';
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
   * Client secret
   */
  client_secret: string;
  /**
   * Cache manager
   */
  cacheManager?: ICacheManager;
}

export class VerIdAttestationService implements AttestationService {

  constructor(private readonly config: VerIdAttestationServiceConfig) {
  }

  private getIssueanceClient(flowUuid: string) {
    return new VeridIssuanceClient({
      issuerUri: this.config.issuerUri,
      client_id: flowUuid,
      redirectUri: this.config.redirectUri,
      options: {
        cacheManager: this.config.cacheManager,
      },
    });
  }

  async intent(payload: CredentialAttribute[], flowUuid: string) {
    const verIdClient = this.getIssueanceClient(flowUuid);
    const codeChallenge = await verIdClient.generateCodeChallenge();

    // Build intent payload
    const intentPayload: IssuanceIntentPayload = {
      payload: {
        data: payload,
      },
    };

    // Create intent with client authentication
    const intentId = await verIdClient.createIssuanceIntent(
      intentPayload,
      codeChallenge.codeChallenge,
      { client_secret: this.config.client_secret },
    );

    // Generate URL with intent
    const userUrl = await verIdClient.generateIssuanceUrl({
      intent_id: intentId,
      state: codeChallenge.state,
      codeChallenge: codeChallenge.codeChallenge,
    });

    return userUrl.issuanceUrl;
  }

  /**
   * This part of the flow is not always reached as a user can
   * just quit the flow when credentials are loaded into the wallet
   * callback is not guaranteed to end up at ARC.
   */
  async authorize() {

    throw Error('Not implemented');


    // const verIdClient = this.getIssueanceClient(flowUuid);


    // const finalized = await verIdClient.finalize({
    //   callbackParams: params,
    //   clientAuth: {
    //     client_secret: this.config.client_secret,
    //   },
    // });

    // const jwt = await verIdClient.decode(finalized, assertIssuanceV1JwtPayload);
    // console.log('JWT', JSON.stringify(jwt.payload.output));

    // TODO: implement revocationKeys as response and test it
    // return jwt.payload.output[0].revocationKeys;
  }
}
