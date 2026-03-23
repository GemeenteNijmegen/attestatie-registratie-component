
import { randomUUID } from 'crypto';
import { AttestatieFormatter } from './attestatie-formatter/AttestatieFormatter';
import { AttestationService } from './attestation-service/AttestationService';
import { AttestationRequest } from './AttestationRequest';
import { TokenVerification } from './auth/TokenVerification';
import { StateStore } from './DynamoDbStateStore';
import { ProductenService } from './producten/ProductenService';

export interface AttestatieRegistratieComponentOptions {
  readonly attestationService?: AttestationService;
  readonly productenService?: ProductenService;
  readonly tokenVerification?: TokenVerification;
  readonly jwtSecret?: string;
  readonly apiKey?: string;
  readonly stateStore?: StateStore;
}

export interface CallbackRequest {
  readonly state: string;
  readonly error?: string;
}
export interface CallbackResponse {
  readonly state: string;
  readonly id?: string;
  readonly type?: string;
  readonly error?: string;
}

export class AttestatieRegistratieComponent {

  constructor(private readonly options: AttestatieRegistratieComponentOptions) {

  }

  /**
   * Note: requested by the portal backend (should be protected)
   * @param request
   * @returns
   */
  async start(request: AttestationRequest) {

    if (!this.options.productenService || !this.options.attestationService) {
      throw Error('Incorrect config provided');
    }

    if (!request.token) {
      throw Error('Authentication token is missing');
    }

    // Verify token
    if (this.options.tokenVerification || this.options.jwtSecret) {
      try {
        const verifier = this.options.tokenVerification ?? new TokenVerification(this.options.jwtSecret || '');
        verifier.verify(request.token);
      } catch (error) {
        console.error(error);
        throw new Error('Faild JWT authentication');
      }
    } else if (this.options.apiKey) {
      if (this.options.apiKey !== request.token) {
        throw new Error('Invalid API key');
      }
    } else {
      throw Error('No authentication mechanism configured');
    }


    if (request.type == 'producten') {
      // 1. Call open-product to get prodcut
      const product = await this.options.productenService.getProduct(request.id);

      // 2. Map to attestation (note: this is a secured endpoint, ownership is verified by portal)
      const upl = product.producttype.uniforme_product_naam;
      const kaartje = AttestatieFormatter.format(upl, product);
      const flowUuid = AttestatieFormatter.getFlowUuid(upl);

      const state = randomUUID();

      const result = await this.options.attestationService.intent(kaartje, flowUuid, state);

      // 3. Store issuance ID
      if (this.options.stateStore) {
        await this.options.stateStore.put(state, { issuanceRunId: result.issuanceRunId, requestType: request.type, id: request.id });
      } else {
        console.warn('Should really store state for ', result.issuanceRunId);
      }

      // 4. Call Ver.ID and return the url
      return result.issuanceUrl;
    }

    throw Error(`Unknown attestation type: ${request.type}`);
  }

  /**
   * Note: requested by the user's browser
   * @param _request
   */
  async callback(request: CallbackRequest): Promise<CallbackResponse> {
    console.log('Callback request', request);

    // Find type and id in state store if there's one
    let type = undefined;
    let id = undefined;
    if (this.options.stateStore) {
      const result = await this.options.stateStore.get(request.state);
      type = result.type;
      id = result.id;
    }

    // Find error in parameters
    let error = undefined;
    if (request.error) {
      console.error(error);
      error = 'Failed to issue to ID wallet';
    }

    return {
      error, id, type,
      state: request.state,
    }
  }

}
