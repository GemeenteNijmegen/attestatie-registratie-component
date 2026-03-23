import { CredentialMapping } from '../attestation-service/AttestationService';
import { Product } from '../producten/ProductSchema';
import { IAttestatieFormatter } from './AttestatieFormatter';

export class OverlijdensakteAttestatieFormatter implements IAttestatieFormatter<Product> {

  getFlowUuid(): string {
    return ''; // TODO fill this
  }

  format(product: Product): CredentialMapping {

    const bsn = product.eigenaren[0]?.bsn;

    if (!bsn || !product.uuid) {
      throw new Error('Invalid product: missing required fields');
    }

    return {
      mapping: {},
      // TODO define credential type with VerID.
    };
  }
}
