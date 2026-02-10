import { AttestationService } from './attestation-service/AttestationService';
import { AttestationRequest } from './AttestationRequest';
import { ProductenService } from './producten/ProductenService';
import { createStandplaatsvergunningCredential } from './producten/Standplaatsvergunning';

export interface AttestatieRegestratieComponentOptions {
  readonly attestationService?: AttestationService;
  readonly productenService?: ProductenService;
}

export class AttestatieRegestratieComponent {

  constructor(private readonly options: AttestatieRegestratieComponentOptions) { }

  /**
   * Note: requested by the portal backend (should be protected)
   * @param request
   * @returns
   */
  async start(request: AttestationRequest) {

    if (!this.options.productenService || !this.options.attestationService) {
      throw Error('Incorrect config provided');
    }

    // 1. Call open-product to get prodcut
    const product = await this.options.productenService.getProduct(request.id);

    // 2. Verify ownership of product (only possible if we have the auth context of the user)
    // As this is a backend call we can ignore this for now.

    // 3. Map to attestation
    const kaartje = createStandplaatsvergunningCredential(product);

    // 4. Call Ver.ID and return the url
    return this.options.attestationService.intent(kaartje);
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

    // this.options.attestationService.authorize()

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