import { CredentialAttribute } from '../attestation-service/AttestationService';

export function createStandplaatsvergunningCredential(product: any): CredentialAttribute[] {

  return [
    {
      attributeUuid: '6cd4ef9f-9c37-4c38-be02-10ac886e4a4e',
      value: product.attributes.bsn,
    },
    {
      attributeUuid: '0a0c7028-e55f-492d-a2ab-851e20c1293f',
      value: product.attributes.kenmerk,
    },
    {
      attributeUuid: 'e07557b5-1a88-4492-a54e-235eadecaa74',
      value: product.attributes.typeLocatie,
    },
    {
      attributeUuid: 'e56347da-15b9-476c-be5d-247a1115858b',
      value: product.attributes.locatie,
    },
    {
      attributeUuid: '00894814-01dc-4498-ba57-f6e3494f4b22',
      value: product.attributes.geldig_tot,
    },
    {
      attributeUuid: 'a7ff1104-2617-446b-aa0f-e111c22b3a4d',
      value: product.attributes.geldig_van,
    },
    {
      attributeUuid: '178a871d-7d8b-42eb-b77f-c64c193bc475',
      value: product.attributes.product_naam,
    },
    {
      attributeUuid: '4a6619c7-2db9-4663-8daf-3423098ae6c5',
      value: product.attributes.product_code,
    },
    {
      attributeUuid: 'f778b289-6a70-488d-8a4c-f0c8facd790e',
      value: product.attributes.uniforme_product_naam,
    },
  ];
}