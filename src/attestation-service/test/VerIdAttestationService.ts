
import { exit } from 'node:process';
import { VerIdAttestationService } from '../VerIdAttestationService';


if (process.env.LIVE_TESTS !== 'true') {
  exit();
} else {
  intent().then(() => console.log('Done!')).catch(error => console.error(error));
}

async function intent() {

  console.log('Found clientid', process.env.VERID_CLIENT_ID);

  const verIdAttestationService = new VerIdAttestationService({
    issuerUri: 'https://oauth.ssi.dev.ver.garden',
    redirectUri: 'http://localhost:3000/callback',
    client_id: process.env.VERID_CLIENT_ID!,
    client_secret: process.env.VERID_CLIENT_SECRET!,
    // flow_id: 'dfe59333-c058-472a-b122-5a76e6d2b9d5',
  });


  const result = await verIdAttestationService.intent(
    [
      {
        attributeUuid: '6cd4ef9f-9c37-4c38-be02-10ac886e4a4e',
        value: '<Citizen service number>',
      },
      {
        attributeUuid: '0a0c7028-e55f-492d-a2ab-851e20c1293f',
        value: '<Reference>',
      },
      {
        attributeUuid: 'e07557b5-1a88-4492-a54e-235eadecaa74',
        value: '<Location type>',
      },
      {
        attributeUuid: 'e56347da-15b9-476c-be5d-247a1115858b',
        value: '<Location>',
      },
      {
        attributeUuid: '00894814-01dc-4498-ba57-f6e3494f4b22',
        value: '<Valid until>',
      },
      {
        attributeUuid: 'a7ff1104-2617-446b-aa0f-e111c22b3a4d',
        value: '<Valid from>',
      },
      {
        attributeUuid: '178a871d-7d8b-42eb-b77f-c64c193bc475',
        value: '<Product name>',
      },
      {
        attributeUuid: '4a6619c7-2db9-4663-8daf-3423098ae6c5',
        value: '<Product code>',
      },
      {
        attributeUuid: 'f778b289-6a70-488d-8a4c-f0c8facd790e',
        value: '<Uniform product name>',
      },
    ],
  );

  console.log(JSON.stringify(result));


}
