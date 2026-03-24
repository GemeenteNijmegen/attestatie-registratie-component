# Adding an Attestation

An attestation maps source data to credential attributes. It's the bridge between a specific source output and the attributes the provider needs to issue a credential.

## 1. Create the attestation class

Attestations live in `src/attestations/{source-name}/`. This groups all attestations that consume the same source.

```ts
// src/attestations/openproduct/OpenProductMyAttestation.ts
import { Attestation } from '../../core/Attestation';
import { MappingValidationError } from '../../errors';
import { MappingResult } from '../../schemas';
import { Product } from '../../sources/OpenProduct';

export class OpenProductMyAttestation extends Attestation<Product> {
  constructor() {
    super({
      name: 'my-attestation',
      sourceName: 'openproduct',
      sourceIdentifier: 'my-product-type',
      sourceIdentifierPath: 'producttype.uniforme_product_naam',
    });
  }

  map(product: Product): MappingResult {
    const bsn = product.eigenaren[0]?.bsn;

    if (!bsn || !product.uuid) {
      throw new MappingValidationError('my-attestation');
    }

    return {
      bsn,
      kenmerk: product.uuid,
      product_naam: product.naam,
      // ... map all attributes the provider needs
    };
  }
}
```

Key points:

- `name` — the attestation identifier, used in the provider's attestation config
- `sourceName` — must match a registered source's `name` (e.g. `'openproduct'`)
- `sourceIdentifier` — the value to match in the source data (e.g. the `uniforme_product_naam`)
- `sourceIdentifierPath` — the dot-notation path in the source data to match against (e.g. `'producttype.uniforme_product_naam'`). ARC uses these two fields to automatically select the correct attestation when `arc.issue()` is called.
- `map()` — receives the typed source output, returns a flat `Record<string, unknown>`

## 2. Export from barrel

```ts
// src/attestations/openproduct/index.ts
export { OpenProductMyAttestation } from './OpenProductMyAttestation';

// src/attestations/index.ts
export * from './openproduct';
```

## 3. Register in ARC

```ts
const arc = new ARC({
  attestations: [
    new OpenProductStandplaatsvergunning(),
    new OpenProductMyAttestation(),  // new
  ],
  // ...
});
```

## 4. Configure the provider

The provider needs to know about the new attestation. For Ver.ID, add the flow mapping:

```ts
new VerID(
  { issuerUri: '...', redirectUri: '...', clientSecret: '...' },
  {
    'standplaatsvergunning': { flowUuid: '...' },
    'my-attestation': { flowUuid: '...' },  // new
  },
)
```

## 5. Write tests

```ts
// test/attestations/OpenProductMyAttestation.test.ts
import { OpenProductMyAttestation } from '../../src/attestations/openproduct/OpenProductMyAttestation';
import { validProduct, productMissingBsn } from '../fixtures/products';

describe('OpenProductMyAttestation', () => {
  const attestation = new OpenProductMyAttestation();

  it('should have correct name and sourceName', () => {
    expect(attestation.name).toBe('my-attestation');
    expect(attestation.sourceName).toBe('openproduct');
  });

  it('should map valid product', () => {
    const result = attestation.map(validProduct);
    expect(result.bsn).toBe('999999333');
  });

  it('should throw on missing bsn', () => {
    expect(() => attestation.map(productMissingBsn)).toThrow();
  });
});
```

## For a different source

If your attestation consumes a different source, create a new directory:

```text
src/attestations/
├── openproduct/          # attestations from OpenProduct source
│   └── ...
└── mysource/             # attestations from MySource
    └── MySourceSomething.ts
```

The class extends `Attestation<MyData>` instead of `Attestation<Product>`, where `MyData` is the typed output of your source.
