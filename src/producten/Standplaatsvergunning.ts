import { Product } from './ProductenService';
import { CredentialAttribute } from '../attestation-service/AttestationService';

export function createStandplaatsvergunningCredential(product: Product): CredentialAttribute[] {

  return [
    {
      attributeUuid: '6cd4ef9f-9c37-4c38-be02-10ac886e4a4e',
      value: product.eigenaren[0].bsn,
    },
    {
      attributeUuid: '0a0c7028-e55f-492d-a2ab-851e20c1293f',
      value: product.uuid,
    },
    {
      attributeUuid: 'e07557b5-1a88-4492-a54e-235eadecaa74',
      value: '(party)tent',
    },
    {
      attributeUuid: 'e56347da-15b9-476c-be5d-247a1115858b',
      value: product.dataobject.location,
    },
    {
      attributeUuid: '00894814-01dc-4498-ba57-f6e3494f4b22',
      value: product.eind_datum,
    },
    {
      attributeUuid: 'a7ff1104-2617-446b-aa0f-e111c22b3a4d',
      value: product.start_datum,
    },
    {
      attributeUuid: '178a871d-7d8b-42eb-b77f-c64c193bc475',
      value: product.naam,
    },
    {
      attributeUuid: '4a6619c7-2db9-4663-8daf-3423098ae6c5',
      value: product.producttype.code,
    },
    {
      attributeUuid: 'f778b289-6a70-488d-8a4c-f0c8facd790e',
      value: product.producttype.uniforme_product_naam,
    },
  ];
}