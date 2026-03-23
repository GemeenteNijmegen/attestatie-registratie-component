import { IAttestatieFormatter } from './AttestatieFormatter';
import { CredentialMapping } from '../attestation-service/AttestationService';
import { Product } from '../producten/ProductSchema';

export class OverlijdensakteAttestatieFormatter implements IAttestatieFormatter<Product> {
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
