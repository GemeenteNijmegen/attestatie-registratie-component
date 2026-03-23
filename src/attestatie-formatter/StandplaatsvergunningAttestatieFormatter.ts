import { CredentialMapping } from '../attestation-service/AttestationService';
import { Product } from '../producten/ProductSchema';
import { IAttestatieFormatter } from './AttestatieFormatter';

export class StandplaatsvergunningAttestatieFormatter implements IAttestatieFormatter<Product> {

  getFlowUuid(): string {
    return 'd7e8f9a0-f001-4000-a000-100000000001';
  }

  format(product: Product): CredentialMapping {

    const bsn = product.eigenaren[0]?.bsn;
    const eind_datum = product.eind_datum ?? '';
    const start_datum = product.start_datum ?? '';
    const locatie = product.dataobject?.location as string ?? 'locatie onbekend';

    if (!bsn || !product.uuid) {
      throw new Error('Invalid product: missing required fields');
    }

    return {
      mapping: {
        typeLocatie: 'onbekend',
        product_naam: product.naam,
        bsn: bsn,
        uniforme_product_naam: product.producttype.uniforme_product_naam,
        locatie: locatie,
        product_code: product.producttype.code,
        geldig_tot: start_datum,
        geldig_van: eind_datum,
        kenmerk: product.uuid,
      },
    };


  }

}
