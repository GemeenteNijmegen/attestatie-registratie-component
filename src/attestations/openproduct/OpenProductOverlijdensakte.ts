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

    const data = product.dataobject as Record<string, string> | undefined;

    return {
      bsn: bsn,
      kenmerk: product.uuid,
      dateofdeath: data?.overlijdensdatum ?? '',
      prefix: data?.voorvoegsel ?? '',
      firstnames: data?.voornamen ?? '',
      initials: data?.voorletters ?? '',
      familyname: data?.achternaam ?? '',
      dateofbirth: data?.geboortedatum ?? '',
      zipcode: data?.postcode ?? '',
      gender: data?.geslacht ?? '',
      street: data?.straat ?? '',
      municipality: data?.gemeente ?? '',
      houseNumber: data?.huisnummer ?? '',
      surname: data?.geboorteNaam ?? '',
      relation: data?.relatieTotOverledene ?? '',
      city: data?.woonplaats ?? '',
    };
  }
}
