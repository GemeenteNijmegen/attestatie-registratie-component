import { CredentialAttribute } from '../attestation-service/AttestationService';

/**
 * The credential for a standplaatsvergunning
 */
export interface StandplaatsvergunningCredential {
  geldig_van: CredentialAttribute;
  geldig_tot: CredentialAttribute;
  locatie: CredentialAttribute;
  typeLocatie: CredentialAttribute;
  kenmerk: CredentialAttribute;
  bsn: CredentialAttribute;
  uniforme_product_naam: CredentialAttribute;
  product_code: CredentialAttribute;
  product_naam: CredentialAttribute;
}


export function createStandplaatsvergunningCredential(product: any): StandplaatsvergunningCredential {
  return {
    geldig_van: {
      attributeUuid: 'uuid-van',
      value: product.attributes.geldig_van,
    },
    geldig_tot: {
      attributeUuid: 'uuid-tot',
      value: product.attributes.geldig_tot,
    },
    locatie: {
      attributeUuid: 'uuid-locatie',
      value: product.attributes.locatie,
    },
    typeLocatie: {
      attributeUuid: 'uuid-typeLocatie',
      value: product.attributes.typeLocatie,
    },
    kenmerk: {
      attributeUuid: 'uuid-kenmerk',
      value: product.attributes.kenmerk,
    },
    bsn: {
      attributeUuid: 'uuid-bsn',
      value: product.attributes.bsn,
    },
    uniforme_product_naam: {
      attributeUuid: 'uuid-uniforme_product_naam',
      value: product.attributes.uniforme_product_naam,
    },
    product_code: {
      attributeUuid: 'uuid-product_code',
      value: product.attributes.product_code,
    },
    product_naam: {
      attributeUuid: 'uuid-product_naam',
      value: product.attributes.product_naam,
    },
  };
}