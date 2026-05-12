# Adding a Source

A source fetches data from an external system. It returns typed, Zod-validated data that attestation mappings can consume.

## 1. Create the config and schema

```ts
// src/sources/MySource.ts
import * as z from 'zod';
import { Source, SourceConfig } from '../core/Source';

// Zod schema for the data this source returns
export const MyDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  attributes: z.record(z.string(), z.unknown()),
});

export type MyData = z.infer<typeof MyDataSchema>;

// Connection config
export interface MySourceConfig extends SourceConfig {
  baseUrl: string;
  apiKey: string;
}
```

## 2. Implement the source

```ts
export class MySource extends Source<MyData, MySourceConfig> {
  constructor(config: MySourceConfig) {
    super({ name: 'my-source', config });
  }

  async fetch(id: string): Promise<MyData> {
    const response = await fetch(`${this.options.config.baseUrl}/items/${id}`, {
      headers: { Authorization: `Bearer ${this.options.config.apiKey}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const data = await response.json();
    return MyDataSchema.parse(data); // Zod validates the response
  }
}
```

The `name` property (set via `super()`) is the key used in `arc.issue({ source: 'my-source', ... })`.

## 3. Export from barrel

```ts
// src/sources/index.ts
export { MySource, MyDataSchema } from './MySource';
export type { MySourceConfig, MyData } from './MySource';
```

## 4. Use it

```ts
const arc = new ARC({
  sources: [
    new MySource({ baseUrl: '...', apiKey: '...' }),
  ],
  // ...
});

await arc.issue({ source: 'my-source', id: 'item-123' });
```

## Notes

- Always validate the API response with Zod. The source is the boundary where untrusted external data enters ARC.
- The source's generic type parameter (`Source<MyData, ...>`) flows through to attestation mappings, giving them typed input.
- Keep the Zod schema in the same file as the source class. It's specific to that source's API response shape.
