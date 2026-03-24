/**
 * Runnable local example — no AWS, no real APIs.
 *
 * Uses InMemory store and a fake OpenProduct server (node http).
 * Run: npx tsx examples/local.ts
 */

import * as http from 'http';
import {
  ARC, OpenProduct, OpenProductStandplaatsvergunning, OpenProductOverlijdensakte, VerID, InMemory,
} from '../src';

// ---------------------------------------------------------------------------
// Fake Open Product API (serves a single product)
// ---------------------------------------------------------------------------

const STANDPLAATSVERGUNNING_PRODUCT = {
  uuid: '12126e1e-9bc1-4a30-b73e-5b5aa4ce8bc4',
  url: 'http://localhost:9876/producten/12126e1e-9bc1-4a30-b73e-5b5aa4ce8bc4',
  naam: 'Vergunning langs de 4-daagse route',
  start_datum: '2026-01-20',
  eind_datum: '2026-01-31',
  aanmaak_datum: '2026-01-19T14:51:20.505685+01:00',
  update_datum: '2026-01-19T14:51:20.505699+01:00',
  producttype: {
    uuid: 'e9522583-d61f-4232-8268-d1596a94bf2d',
    code: 'TEST-4D',
    uniforme_product_naam: 'standplaatsvergunning',
  },
  eigenaren: [
    {
      uuid: '1dbe98d5-118e-4143-8e24-f5c866efc799',
      bsn: '999999333',
    },
  ],
  dataobject: {
    location: 'St. Annastraat 250 6525 HA NIJMEGEN',
  },
};

const OVERLIJDENSAKTE_PRODUCT = {
  uuid: '341bd5ac-6a68-4ac2-812e-b9e4f4aea764',
  url: 'http://localhost:9876/producten/341bd5ac-6a68-4ac2-812e-b9e4f4aea764',
  naam: 'Overlijdensakte test',
  start_datum: null,
  eind_datum: null,
  aanmaak_datum: '2026-03-24T11:24:24.042924+01:00',
  update_datum: '2026-03-24T11:24:24.042940+01:00',
  producttype: {
    uuid: '16ac80c5-c10d-4efd-9be0-d81966772aa6',
    code: 'TEST-PINK',
    uniforme_product_naam: 'overlijdensakte',
  },
  eigenaren: [
    {
      uuid: '31411e0a-c87a-4d39-b328-c71361951ec8',
      bsn: '999999333',
    },
  ],
  dataobject: {
    straat: 'Kerkstraat',
    gemeente: 'Utrecht',
    geslacht: 'Man',
    postcode: '1234 AB',
    voornamen: 'Hendrik Jan',
    achternaam: 'Berg',
    akteNummer: '2024-BS-000892',
    huisnummer: '42-A',
    woonplaats: 'Utrecht',
    voorletters: 'H.J.',
    voorvoegsel: 'van der',
    geboorteNaam: 'Vermeulen',
    geboortedatum: '1945-03-12',
    overlijdensdatum: '2024-02-28',
    relatieTotOverledene: 'Ouder',
  },
};

const PRODUCTS: Record<string, unknown> = {
  [STANDPLAATSVERGUNNING_PRODUCT.uuid]: STANDPLAATSVERGUNNING_PRODUCT,
  [OVERLIJDENSAKTE_PRODUCT.uuid]: OVERLIJDENSAKTE_PRODUCT,
};

function startFakeOpenProduct(): Promise<http.Server> {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      console.log(`  [OpenProduct] ${req.method} ${req.url}`);
      const uuid = req.url?.split('/').pop();
      const product = uuid ? PRODUCTS[uuid] : undefined;
      if (product) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(product));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ detail: 'Not found' }));
      }
    });
    server.listen(9876, () => resolve(server));
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const server = await startFakeOpenProduct();
  console.log('Fake Open Product API running on http://localhost:9876\n');

  // --- ARC setup ---

  let callCount = 0;
  const mockVerIdClient = {
    generateCodeChallenge: async () => ({ codeChallenge: `mock-challenge-${++callCount}`, state: `mock-state-${callCount}` }),
    createIssuanceIntent: async () => ({ intent_id: `mock-intent-${callCount}`, issuance_run_uuid: `mock-run-${callCount}` }),
    generateIssuanceUrl: async () => ({ issuanceUrl: 'https://mock.ver.id/issuance' }),
  } as any;

  const arc = new ARC({
    provider: new VerID(
      {
        issuerUri: 'https://ssi.oauth.ver.id/',
        redirectUri: 'http://localhost:9876/callback',
        clientSecret: 'NrHlPxvbULWs47P-KYFQxJkLwiGcrIoSEhF06rVDbNo',
      },
      {
        standplaatsvergunning: { flowUuid: 'd7e8f9a0-f001-4000-a000-100000000001' },
        overlijdensakte: { flowUuid: 'ffffffff-1111-2222-3333-444444444444' },
      },
      mockVerIdClient,
    ),
    store: new InMemory(),
    sources: [
      new OpenProduct({
        baseUrl: 'http://localhost:9876',
        apiToken: 'fake-token',
      }),
    ],
    attestations: [
      new OpenProductStandplaatsvergunning(),
      new OpenProductOverlijdensakte(),
    ],
  });

  arc.on('issuance', async (event) => {
    console.log(`  [Event] issuance → ${event.status}`, event.context);
  });

  // --- Issue standplaatsvergunning ---

  console.log('=== arc.issue() — standplaatsvergunning ===');
  try {
    const result = await arc.issue({
      source: 'openproduct',
      id: STANDPLAATSVERGUNNING_PRODUCT.uuid,
    });
    console.log('  Result:', result);
    console.log();

    if (result.type === 'oauth') {
      // --- Simulate callback (success) ---
      // In a real flow, the browser is redirected to /callback?state=xxx&code=yyy.

      console.log('=== arc.provider.callback() — success ===');
      const successParams = new URLSearchParams({
        state: result.callbackState,
        code: 'fake-auth-code',
      });
      try {
        const cbResult = await arc.provider.callback(successParams);
        console.log('  Result:', cbResult);
      } catch (err: any) {
        console.log(`  Error: ${err.message} [code: ${err.code}]`);
      }

      // --- Simulate callback (error / user denied) ---

      console.log('\n=== arc.issue() — second issuance for error callback ===');
      const result2 = await arc.issue({
        source: 'openproduct',
        id: STANDPLAATSVERGUNNING_PRODUCT.uuid,
      });
      console.log('  Result:', result2);
      console.log();

      if (result2.type === 'oauth') {
        console.log('=== arc.provider.callback() — error ===');
        const errorParams = new URLSearchParams({
          state: result2.callbackState,
          error: 'access_denied',
          error_description: 'The user denied the authorization request',
        });
        try {
          const cbResult = await arc.provider.callback(errorParams);
          console.log('  Result:', cbResult);
        } catch (err: any) {
          console.log(`  Error: ${err.message} [code: ${err.code}]`);
        }
      }
    }
  } catch (err: any) {
    console.log(`  Unexpected error: ${err.message}`);
    if (err.code) console.log(`  Error code: ${err.code}`);
  }

  // --- Issue overlijdensakte ---

  console.log('\n=== arc.issue() — overlijdensakte ===');
  try {
    const result = await arc.issue({
      source: 'openproduct',
      id: OVERLIJDENSAKTE_PRODUCT.uuid,
    });
    console.log('  Result:', result);
    console.log();

    if (result.type === 'oauth') {
      console.log('=== arc.provider.callback() — overlijdensakte success ===');
      const successParams = new URLSearchParams({
        state: result.callbackState,
        code: 'fake-auth-code',
      });
      try {
        const cbResult = await arc.provider.callback(successParams);
        console.log('  Result:', cbResult);
      } catch (err: any) {
        console.log(`  Error: ${err.message} [code: ${err.code}]`);
      }
    }
  } catch (err: any) {
    console.log(`  Unexpected error: ${err.message}`);
    if (err.code) console.log(`  Error code: ${err.code}`);
  }

  console.log('\nDone.');
  server.close();
}

main().catch(console.error);
