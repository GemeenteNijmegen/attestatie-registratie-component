import { Attestation } from '../../core/Attestation';
import { MappingValidationError } from '../../errors';
import { MappingResult } from '../../schemas';
import { Product } from '../../sources/OpenProduct';

export class OpenProductOverlijdensakte extends Attestation<Product> {
  constructor() {
    super({
      name: 'overlijdensakte',
      sourceName: 'openproduct',
      sourceIdentifier: 'overlijdensakte',
      sourceIdentifierPath: 'producttype.uniforme_product_naam',
    });
  }

  map(product: Product): MappingResult {
    const bsn = product.eigenaren[0]?.bsn;

    if (!bsn || !product.uuid) {
      throw new MappingValidationError('overlijdensakte');
    }

    return {};
  }
}
