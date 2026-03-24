# Attestatie Registratie Component (ARC)

Herbruikbaar component voor het uitgeven en intrekken van digitale attestaties (verifieerbare credentials) aan burgers, conform het [Common Ground](https://commonground.nl/) model.

## Wat is ARC?

ARC koppelt databronnen (zoals [Open Product](https://github.com/maykinmedia/open-product)) aan een attestatie-provider (zoals [Ver.ID](https://ver.id/)) om gemeentelijke producten als verifieerbare credentials in een id-wallet te laden.

**Voorbeeld:** Een burger op mijn.nijmegen.nl bekijkt zijn standplaatsvergunning en laadt deze in zijn id-wallet. Een handhaver kan de attestatie vervolgens scannen ter verificatie.

## Architectuur

```text
Bron  →  Attestatie (mapping)  →  Provider
  ↕              ↕                    ↕
OpenProduct   Standplaatsvergunning  Ver.ID
              Overlijdensakte        (andere provider)
```

ARC is opgebouwd uit pluggable abstracties:

- **Source** — Haalt data op uit een extern systeem (bijv. Open Product API)
- **Attestation** — Vertaalt brondata naar credential-attributen
- **Provider** — Handelt de daadwerkelijke uitgifte en intrekking af
- **Store** — Tijdelijke opslag voor sessiestate (bijv. DynamoDB)

Zie [docs/architectuur.md](docs/architectuur.md) voor een volledig overzicht.

## Snel starten

```bash
npm install @gemeentenijmegen/attestatie-registratie-component
```

```ts
import { ARC, OpenProduct, OpenProductStandplaatsvergunning, VerID, DynamoDb } from '@gemeentenijmegen/attestatie-registratie-component';

const arc = new ARC({
  provider: new VerID(
    { issuerUri: '...', redirectUri: '...', clientSecret: '...' },
    { 'standplaatsvergunning': { flowUuid: '...' } },
  ),
  store: new DynamoDb({ tableName: 'arc-sessions' }),
  sources: [new OpenProduct({ baseUrl: '...', apiToken: '...' })],
  attestations: [new OpenProductStandplaatsvergunning()],
});

arc.on('issuance', async (event) => {
  await mijnDatabase.update(event.sessionId, { status: event.status });
});

// Attestatie uitgeven
const { url, sessionId } = await arc.issue({
  source: 'openproduct', id: 'product-uuid', attestation: 'standplaatsvergunning',
});

// Status opvragen
const { status } = await arc.status({ sessionId });

// Intrekken
await arc.revoke({ sessionId });
```

## Documentatie

- [Architectuur](docs/architectuur.md) — Hoe ARC werkt
- [Integratie](docs/integratie.md) — ARC koppelen aan uw applicatie
- [Een provider toevoegen](docs/adding-a-provider.md) — Nieuwe attestatie-provider implementeren
- [Een bron toevoegen](docs/adding-a-source.md) — Nieuwe databron aansluiten
- [Een attestatie toevoegen](docs/adding-an-attestation.md) — Nieuw attestatietype definiëren

## Ontwikkeling

```bash
npx projen build      # compileren + lint + testen
npx jest              # alleen testen
npx tsc --noEmit      # alleen typecheck
```

## Achtergrond

Ontwikkeld door [Gemeente Nijmegen](https://www.nijmegen.nl/) in samenwerking met [Ver.ID](https://ver.id/) en [Maykin Media](https://www.maykinmedia.nl/) (Open Product). Ontstaan op de Common Ground Field Labs, georganiseerd door [VNG Realisatie](https://vng.nl/artikelen/common-ground).

## Licentie

[EUPL-1.2](LICENSE)
