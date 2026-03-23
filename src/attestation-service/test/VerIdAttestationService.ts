
import console from 'node:console';
import { randomUUID } from 'node:crypto';
import { exit } from 'node:process';
import { MemoryStorageCacheManager } from '@ver-id/node-client';
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
    client_secret: process.env.VERID_CLIENT_SECRET!,
    cacheManager: new MemoryStorageCacheManager(),
    // flow_id: 'dfe59333-c058-472a-b122-5a76e6d2b9d5',
  });


  const result = await verIdAttestationService.intent({
    mapping: {
      abc: 'def',
    },
  },
  randomUUID(), // flowuuid
  );

  console.log(JSON.stringify(result));


}
