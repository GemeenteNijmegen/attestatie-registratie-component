
import { MemoryStorageCacheManager } from '@ver-id/node-client';
import { configDotenv } from 'dotenv';
import console from 'node:console';
import { exit } from 'node:process';
import { VerIdAttestationService } from '../VerIdAttestationService';


if (process.env.LIVE_TESTS !== 'true') {
  console.log('enable live_tests env var == true');
  exit();
} else {
  intent().then(() => console.log('Done!')).catch(error => console.error(error));
}

async function intent() {

  configDotenv()

  console.log('Found clientid', process.env.VERID_CLIENT_ID);

  const verIdAttestationService = new VerIdAttestationService({
    issuerUri: 'https://ssi.oauth.ver.id',
    redirectUri: 'https://arc.mijn-services-dev.csp-nijmegen.nl/callback',
    client_secret: process.env.VERID_CLIENT_SECRET!,
    cacheManager: new MemoryStorageCacheManager(),
  });


  const result = await verIdAttestationService.intent({
    "mapping": {
      "typeLocatie": "<typeLocatie>",
      "product_naam": "<product_naam>",
      "bsn": "<bsn>",
      "uniforme_product_naam": "<uniforme_product_naam>",
      "locatie": "<locatie>",
      "product_code": "<product_code>",
      "geldig_tot": "<geldig_tot>",
      "geldig_van": "<geldig_van>",
      "kenmerk": "<kenmerk>"
    },
  },
    process.env.VERID_CLIENT_ID!,
  );

  console.log(JSON.stringify(result));


}
