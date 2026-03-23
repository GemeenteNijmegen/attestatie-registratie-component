
import { AttestatieFormatter } from './attestatie-formatter/AttestatieFormatter';
import { AttestationService } from './attestation-service/AttestationService';
import { AttestationRequest } from './AttestationRequest';
import { TokenVerification } from './auth/TokenVerification';
import { ProductenService } from './producten/ProductenService';

export interface AttestatieRegestratieComponentOptions {
  readonly attestationService?: AttestationService;
  readonly productenService?: ProductenService;
  readonly tokenVerification?: TokenVerification;
  readonly jwtSecret?: string;
  readonly apiKey?: string;
}

export class AttestatieRegestratieComponent {

  constructor(private readonly options: AttestatieRegestratieComponentOptions) {

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
      // 4. Call Ver.ID and return the url
      return this.options.attestationService.intent(kaartje, flowUuid);
    }

    throw Error(`Unknown attestation type: ${request.type}`);
  }

  /**
   * Note: requested by the user's browser
   * @param _request
   */
  async callback(request: any) {

    if (!this.options.productenService || !this.options.attestationService) {
      throw Error('Incorrect config provided');
    }

    console.log('Callback request', request);

    // TODO _request is not the correct param, we need the actual url params of the request
    // TODO get parameters from url

    // this.options.attestationService.authorize({});

    // Get jwt token from Ver.ID using auth code
    // Parse JWT and store revocation key
    // Redirect user to mijn-nijmegen.

    // TODO: proper error handling
    return !JSON.stringify(request).toLocaleLowerCase().includes('error');
  }

  /**
   * For testing purposes
   * @returns
   */
  hello() {
    return 'hello from ARC!';
  }

}