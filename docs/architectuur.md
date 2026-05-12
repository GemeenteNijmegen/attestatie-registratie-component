# Architectuur

## Overzicht

Het Attestatie Registratie Component (ARC) is een library die drie stappen orkestreert:

1. **Ophalen** — Data ophalen uit een bron (bijv. een product uit Open Product)
2. **Mappen** — Brondata vertalen naar credential-attributen
3. **Uitgeven** — De attestatie laten uitgeven door een provider (bijv. Ver.ID)

```text
┌─────────┐      ┌──────────────┐      ┌──────────┐
│  Source  │─────▶│  Attestation │─────▶│ Provider │
│ (bron)  │ data │  (mapping)   │ attr │ (uitgave)│
└─────────┘      └──────────────┘      └──────────┘
     ↑                                       │
     │                                       ▼
  OpenProduct                         Ver.ID / anders
```

## Kernabstracties

ARC kent vijf kernabstracties in `src/core/`:

| Abstractie | Verantwoordelijkheid | Voorbeeld |
|---|---|---|
| **Source** | Data ophalen uit extern systeem | `OpenProduct` — haalt producten op via de Open Product API |
| **Attestation** | Brondata vertalen naar credential-attributen | `OpenProductStandplaatsvergunning` — vertaalt een product naar standplaatsvergunning-attributen |
| **Provider** | Attestatie uitgeven en intrekken | `VerID` — gebruikt de Ver.ID OAuth-flow voor uitgifte |
| **Store** | Tijdelijke sessiestate opslaan (met TTL) | `DynamoDb`, `InMemory` |
| **Session** | Sessiestate en callback-routing beheren | Intern gebruikt door ARC en providers |

Elke abstractie volgt hetzelfde patroon: een abstracte basisklasse met een `options: { config }` constructor. Implementaties breiden de config-types uit met hun eigen velden.

## Sessielevenscyclus

```text
issue()    →  pending  →  callback()  →  issued
                                      →  aborted (gebruiker weigert / fout)
                       →  (geen callback, TTL verloopt)
revoke()   →  revoked
provider   →  expired (credentials verlopen)
```

Bij elke statusovergang in het uitgifteproces wordt een `issuance` event uitgestuurd. De consumer (bijv. mijn.nijmegen.nl) luistert via `arc.on('issuance', handler)` om de eigen database bij te werken.

## Publieke API

ARC biedt drie methoden:

```ts
arc.issue(params)   → IssueResultOAuth | IssueResultDirect  // Attestatie starten
arc.status(params)  → { sessionId, status } // Status opvragen
arc.revoke(params)  → { sessionId }         // Attestatie intrekken
```

Provider-specifieke endpoints (zoals de OAuth-callback van Ver.ID) zijn beschikbaar via `arc.provider`:

```ts
arc.provider.callback(searchParams)  // Ver.ID-specifiek
```

## Directorystructuur

```text
src/
├── core/                  # Abstracties (Source, Attestation, Provider, Store, Session)
├── sources/               # Bronimplementaties (OpenProduct)
├── attestations/          # Attestatiemappings per bron
│   └── openproduct/       # Mappings voor OpenProduct-data
├── providers/             # Providerimplementaties (VerID)
├── adapters/              # Store-implementaties (InMemory, DynamoDB)
├── schemas.ts             # Zod-schema's en types
├── ARC.ts                 # Orchestrator
└── index.ts               # Barrel exports
```

## Uitbreiden

ARC is ontworpen om uitgebreid te worden zonder de bestaande code aan te passen:

- **Nieuwe bron** → één bestand in `sources/` — zie [adding-a-source.md](adding-a-source.md)
- **Nieuwe attestatie** → één bestand in `attestations/{bron}/` — zie [adding-an-attestation.md](adding-an-attestation.md)
- **Nieuwe provider** → één bestand in `providers/` — zie [adding-a-provider.md](adding-a-provider.md)
- **Nieuwe store** → één bestand in `adapters/`

Geen van deze wijzigingen raakt `ARC.ts` of andere bestaande bestanden.

## Bouwen en testen

```bash
npx projen build      # compileren + lint + testen
npx jest              # alleen testen
npx tsc --noEmit      # alleen typecheck
```
