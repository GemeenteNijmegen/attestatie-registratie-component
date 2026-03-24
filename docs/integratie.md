# Integratie

Handleiding voor het koppelen van ARC aan uw applicatie.

## Installatie

```bash
npm install @gemeentenijmegen/attestatie-registratie-component
```

## Configuratie

ARC heeft vier onderdelen nodig:

### 1. Provider

De attestatie-provider die de daadwerkelijke uitgifte verzorgt. Voor Ver.ID:

```ts
import { VerID } from '@gemeentenijmegen/attestatie-registratie-component';

const provider = new VerID(
  {
    issuerUri: 'https://oauth.ssi.ver.garden',
    redirectUri: 'https://uw-domein.nl/callback',
    clientSecret: process.env.VERID_CLIENT_SECRET!,
  },
  {
    // Per attestatie de Ver.ID flow-configuratie
    'standplaatsvergunning': { flowUuid: 'uw-flow-uuid' },
  },
);
```

### 2. Store

Tijdelijke opslag voor sessiestate. Records verlopen automatisch (standaard 1 uur).

```ts
import { DynamoDb, InMemory } from '@gemeentenijmegen/attestatie-registratie-component';

// Productie: DynamoDB (regio en credentials via AWS SDK defaults)
const store = new DynamoDb({
  tableName: 'arc-sessions',
  defaultTtlSeconds: 3600,
});

// Lokaal ontwikkelen: in-memory
const store = new InMemory();
```

De DynamoDB-tabel moet een `id` partition key hebben en [TTL ingeschakeld](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html) op het `ttl` attribuut. Optioneel kunt u `partitionKey` en `ttlAttribute` configureren als uw tabel andere attribuutnamen gebruikt.

### 3. Bronnen

Databronnen waar ARC gegevens uit ophaalt:

```ts
import { OpenProduct } from '@gemeentenijmegen/attestatie-registratie-component';

const sources = [
  new OpenProduct({
    baseUrl: 'https://uw-open-product-api.nl/api/v1',
    apiToken: process.env.OPEN_PRODUCT_TOKEN!,
  }),
];
```

### 4. Attestaties

Mappings die brondata vertalen naar credential-attributen:

```ts
import {
  OpenProductStandplaatsvergunning,
  OpenProductOverlijdensakte,
} from '@gemeentenijmegen/attestatie-registratie-component';

const attestations = [
  new OpenProductStandplaatsvergunning(),
  new OpenProductOverlijdensakte(),
];
```

## ARC initialiseren

```ts
import { ARC } from '@gemeentenijmegen/attestatie-registratie-component';

const arc = new ARC({
  provider,
  store,
  sources,
  attestations,
});

arc.on('issuance', async (event) => {
  // event.sessionId — de sessie-ID
  // event.status — 'pending' | 'issued' | 'aborted'
  // event.context — { source, id, attestation }
  await uwDatabase.update(event.sessionId, {
    status: event.status,
    bijgewerkt: new Date().toISOString(),
  });
});
```

## Endpoints inrichten

ARC is een library zonder eigen HTTP-laag. U koppelt de functies aan uw eigen endpoints.

### Uitgeven (POST /issue)

Aangeroepen door uw portaal-backend:

```ts
const body = JSON.parse(request.body);
const result = await arc.issue({
  source: 'openproduct',
  id: body.productId,
});
// De attestatie wordt automatisch bepaald op basis van de brondata.
// result.type — 'oauth' of 'direct'
// result.sessionId — sla op in uw eigen database
// Bij OAuth: result.url — redirect de gebruiker hierheen
// Bij OAuth: result.callbackState — de state voor de callback
```

### Callback (GET /callback)

Aangeroepen door de browser van de gebruiker na het wallet-proces:

```ts
const searchParams = new URLSearchParams(request.queryStringParameters);
const result = await arc.provider.callback(searchParams);
// result.success — true als de uitgifte geslaagd is
// result.sessionId — de bijbehorende sessie
// result.context — { source, id, attestation }
// Redirect de gebruiker terug naar uw portaal
```

### Status (GET /status)

Optioneel — voor het pollen van de sessiestatus:

```ts
const result = await arc.status({ sessionId: request.queryStringParameters.sessionId });
// result.status — 'pending' | 'issued' | 'revoked' | 'expired'
```

### Intrekken (POST /revoke)

```ts
const body = JSON.parse(request.body);
await arc.revoke({
  sessionId: body.sessionId,
});
```

## AWS Lambda

Zie [examples/aws.ts](../examples/aws.ts) voor een compleet voorbeeld met vier Lambda-handlers.

## Authenticatie

ARC handelt geen authenticatie af. Uw applicatie is verantwoordelijk voor het verifiëren van de aanroeper voordat ARC-functies worden aangeroepen (bijv. JWT-verificatie, API-key controle).
