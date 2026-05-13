# Plan: Notification Handling

## Doel

ARC uitbreiden met een `notify()` methode om notificaties van bronnen te ontvangen en automatisch attestaties in te trekken wanneer de onderliggende data wijzigt of vervalt.

## Architectuur

```text
Notificatie → ARC.notify() → Source.shouldRevoke() → Provider.revoke() → Store.update()
```

## Stappen

### 1. Notificatieschema definiëren

**Bestand:** `src/schemas.ts`

Toevoegen:
- `NotificationSchema` — Zod-schema voor inkomende notificaties
- `NotifyParams` — Parameters voor `arc.notify()`
- `NotifyResult` — Resultaat met lijst van ingetrokken sessies
- `ChannelEnum` — Enum voor notificatiekanalen (bijv. 'opennotificaties', 'webhook')

```ts
export const NotificationSchema = z.object({
  channel: z.string(),           // Identificeert de bron (bijv. 'opennotificaties')
  resourceUrl: z.string().url(), // URL van de gewijzigde resource
  action: z.enum(['create', 'update', 'delete']),
  payload: z.record(z.unknown()).optional(),
});

export const NotifyParamsSchema = z.object({
  notification: NotificationSchema,
});

export const NotifyResultSchema = z.object({
  revokedSessions: z.array(z.string()),
});
```

### 2. Source-abstractie uitbreiden

**Bestand:** `src/core/Source.ts`

Toevoegen:
- `channel: string` — Identificeert het notificatiekanaal van deze bron
- `shouldRevoke(notification)` — Bepaalt of attestaties ingetrokken moeten worden
- `findSessions(resourceId)` — Haalt sessie-IDs op voor een resource

```ts
export abstract class Source<T = unknown, TConfig extends SourceConfig = SourceConfig> extends Base {
  readonly name: string;
  readonly channel: string; // Nieuw

  constructor(protected readonly options: SourceOptions<TConfig>) {
    super();
    this.name = options.name;
    this.channel = options.channel ?? options.name; // Default: naam als channel
  }

  abstract fetch(id: string): Promise<T>;
  
  // Nieuw: bepaal of notificatie tot revocatie moet leiden
  abstract shouldRevoke(notification: Notification): Promise<boolean>;
  
  // Nieuw: vind sessies voor een resource-ID
  abstract findSessions(resourceId: string): Promise<string[]>;
}
```

### 3. SourceOptions uitbreiden

**Bestand:** `src/core/Source.ts`

```ts
export interface SourceOptions<TConfig extends SourceConfig = SourceConfig> {
  name: string;
  channel?: string; // Nieuw, optioneel
  config: TConfig;
}
```

### 4. OpenProduct implementatie uitbreiden

**Bestand:** `src/sources/OpenProduct.ts`

Implementeren:
- `channel = 'opennotificaties'`
- `shouldRevoke()` — Controleert of product-status wijziging revocatie vereist
- `findSessions()` — Haalt sessies op uit store via product-UUID

```ts
export class OpenProduct extends Source<Product, OpenProductConfig> {
  constructor(config: OpenProductConfig) {
    super({ 
      name: 'openproduct', 
      channel: 'opennotificaties',
      config 
    });
  }

  async shouldRevoke(notification: Notification): Promise<boolean> {
    // Haal product op via resourceUrl
    const productId = this.extractProductId(notification.resourceUrl);
    const product = await this.fetch(productId);
    
    // Revoke als status niet meer 'actief' is
    return product.status !== 'actief';
  }

  async findSessions(resourceId: string): Promise<string[]> {
    // Query store voor sessies met context.source='openproduct' en context.id=resourceId
    // Vereist nieuwe Store.query() methode
    return await this.store.query({ source: this.name, id: resourceId });
  }

  private extractProductId(url: string): string {
    // Extract UUID uit URL: .../producten/{uuid}
    const match = url.match(/\/producten\/([a-f0-9-]+)/);
    return match?.[1] ?? '';
  }
}
```

### 5. Store-abstractie uitbreiden

**Bestand:** `src/core/Store.ts`

Toevoegen:
- `query(filter)` — Zoekt sessies op basis van context-velden

```ts
export interface SessionQuery {
  source?: string;
  id?: string;
  attestation?: string;
}

export abstract class Store<TConfig extends StoreConfig = StoreConfig> extends Base {
  // Bestaande methoden...
  
  // Nieuw: query sessies op basis van context
  abstract query(filter: SessionQuery): Promise<string[]>;
}
```

### 6. Store-implementaties uitbreiden

**Bestand:** `src/adapters/InMemory.ts`

```ts
async query(filter: SessionQuery): Promise<string[]> {
  const results: string[] = [];
  for (const [key, value] of this.store.entries()) {
    if (key.startsWith('callback:')) continue;
    
    const match = 
      (!filter.source || value.source === filter.source) &&
      (!filter.id || value.id === filter.id) &&
      (!filter.attestation || value.attestation === filter.attestation);
    
    if (match) results.push(key);
  }
  return results;
}
```

**Bestand:** `src/adapters/DynamoDb.ts`

```ts
async query(filter: SessionQuery): Promise<string[]> {
  // Gebruik DynamoDB Query/Scan met FilterExpression
  // Vereist mogelijk GSI op source/id velden voor performance
  // Implementatie afhankelijk van tabelstructuur
}
```

### 7. ARC.notify() methode toevoegen

**Bestand:** `src/ARC.ts`

```ts
async notify(params: NotifyParams): Promise<NotifyResult> {
  const validated = NotifyParamsSchema.parse(params);
  const notification = validated.notification;

  // 1. Vind source op basis van channel
  const source = this.findSourceByChannel(notification.channel);
  if (!source) {
    // Geen source voor dit channel, negeer notificatie
    return { revokedSessions: [] };
  }

  // 2. Bepaal of revocatie nodig is
  const shouldRevoke = await source.shouldRevoke(notification);
  if (!shouldRevoke) {
    return { revokedSessions: [] };
  }

  // 3. Vind resource-ID uit notification
  const resourceId = this.extractResourceId(notification, source);

  // 4. Vind alle sessies voor deze resource
  const sessionIds = await source.findSessions(resourceId);

  // 5. Revoke elke sessie
  const revokedSessions: string[] = [];
  for (const sessionId of sessionIds) {
    try {
      await this.provider.revoke(sessionId);
      revokedSessions.push(sessionId);
    } catch (error) {
      // Log maar ga door met andere sessies
      console.error(`Failed to revoke session ${sessionId}:`, error);
    }
  }

  return { revokedSessions };
}

private findSourceByChannel(channel: string): Source<any, any> | undefined {
  for (const source of this.options.sources) {
    if (source.channel === channel) return source;
  }
  return undefined;
}

private extractResourceId(notification: Notification, source: Source): string {
  // Delegeer naar source-specifieke logica
  // Of gebruik generieke URL-parsing
  return notification.resourceUrl.split('/').pop() ?? '';
}
```

### 8. Provider.revoke() implementeren

**Bestand:** `src/providers/VerID.ts`

Vervang `NotImplementedError` met daadwerkelijke Ver.ID API-call:

```ts
async revoke(sessionId: string): Promise<void> {
  if (!this.session) {
    throw new ProviderNotInitializedError();
  }

  // Haal context op uit sessie
  const context = await this.session.get(sessionId);
  const attestationConfig = this.getAttestationConfig(context.attestation);
  const client = this.getClient(attestationConfig.flowUuid);

  // Roep Ver.ID revocation API aan
  await client.revokeIssuance(sessionId);

  // Emit revocation event
  await this.emitIssuanceEvent({
    sessionId,
    status: 'revoked',
    context,
  });

  // Cleanup sessie
  await this.session.delete(sessionId);
}
```

### 9. Revocation event toevoegen

**Bestand:** `src/schemas.ts`

Uitbreiden van `IssuanceStatusEnum`:

```ts
export const IssuanceStatusEnum = z.enum(['pending', 'issued', 'aborted', 'revoked']);
```

Event blijft `issuance` met status `'revoked'`.

### 10. Tests toevoegen

**Bestand:** `test/ARC.notify.test.ts` (nieuw)

- Test notificatie met bekende source
- Test notificatie met onbekende channel
- Test notificatie die niet tot revocatie leidt
- Test notificatie die meerdere sessies intrekt
- Test foutafhandeling bij revocatie

**Bestand:** `test/sources/OpenProduct.notify.test.ts` (nieuw)

- Test `shouldRevoke()` met verschillende product-statussen
- Test `findSessions()` met meerdere sessies
- Test URL-parsing

## Toekomstige uitbreidingen

### Fase 2: URL-matching voor meerdere sources

Wanneer meerdere sources hetzelfde channel gebruiken:

```ts
private findSourceByChannel(channel: string, resourceUrl: string): Source | undefined {
  const candidates = this.options.sources.filter(s => s.channel === channel);
  
  if (candidates.length === 1) return candidates[0];
  
  // Match baseUrl uit source config met resourceUrl
  for (const source of candidates) {
    if (resourceUrl.startsWith(source.options.config.baseUrl)) {
      return source;
    }
  }
  
  return undefined;
}
```

### Fase 3: Batch-notificaties

Voor performance bij veel notificaties:

```ts
async notifyBatch(params: NotifyBatchParams): Promise<NotifyBatchResult> {
  // Groepeer per source, batch revocaties
}
```

### Fase 4: Notificatie-filtering

Source kan aangeven welke notificaties relevant zijn:

```ts
abstract class Source {
  abstract isRelevant(notification: Notification): boolean;
}
```

## Afhankelijkheden

- Ver.ID client library moet revocation API ondersteunen
- Store moet query-functionaliteit krijgen (mogelijk GSI in DynamoDB)
- OpenProduct moet notificaties kunnen sturen (via Open Notificaties)

## Migratie

Bestaande code blijft werken:
- `channel` is optioneel, default = `name`
- `shouldRevoke()` en `findSessions()` zijn abstract, bestaande sources moeten implementeren
- Nieuwe `notify()` methode is additioneel, bestaande API ongewijzigd
