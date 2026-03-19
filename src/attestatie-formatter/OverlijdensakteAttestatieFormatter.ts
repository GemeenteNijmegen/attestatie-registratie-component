import { IAttestatieFormatter } from './AttestatieFormatter';
import { CredentialAttribute } from '../attestation-service/AttestationService';
import { Product } from '../producten/ProductSchema';

export class OverlijdensakteAttestatieFormatter implements IAttestatieFormatter<Product> {
  format(product: Product): CredentialAttribute[] {

    const bsn = product.eigenaren[0]?.bsn;

    if (!bsn || !product.uuid) {
      throw new Error('Invalid product: missing required fields');
    }

    return [
      {
        attributeUuid: 'xxx-xxx-xxx-xxx',
        value: bsn,
      },
      // TODO define credential type with VerID.
    ];
  }
}
