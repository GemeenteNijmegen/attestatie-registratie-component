# Adding a Provider

A provider handles the actual issuance and revocation of attestations. It's a black box to ARC — it receives an attestation name + mapped attributes and handles everything else internally.

## 1. Create the config types

```ts
// src/providers/MyProvider.ts
import { Provider, ProviderConfig, AttestationConfig } from '../core/Provider';
import { SessionContext } from '../core/Session';
import { MappingResult, ProviderIssueResult, SessionStatus } from '../schemas';

export interface MyProviderConfig extends ProviderConfig {
  apiUrl: string;
  apiKey: string;
}

export interface MyProviderAttestationConfig extends AttestationConfig {
  templateId: string;  // provider-specific per-attestation config
}
```

## 2. Implement the provider

```ts
export class MyProvider extends Provider<MyProviderConfig, MyProviderAttestationConfig> {
  constructor(
    config: MyProviderConfig,
    attestations: Record<string, MyProviderAttestationConfig>,
  ) {
    super({ config, attestations });
  }

  async issue(context: SessionContext, mappingResult: MappingResult): Promise<ProviderIssueResult> {
    // context contains { source, id, attestation }
    const attestationConfig = this.getAttestationConfig(context.attestation);

    // Call your provider's API
    const result = await callMyApi(this.options.config.apiUrl, {
      templateId: attestationConfig.templateId,
      attributes: mappingResult,
    });

    // Return 'oauth' for redirect-based flows, 'direct' for immediate issuance
    return {
      type: 'oauth',
      url: result.redirectUrl,
      sessionId: result.sessionId,
      callbackState: result.state,
    };
  }

  async status(sessionId: string): Promise<SessionStatus> {
    // Query your provider for session status
    // Map to: 'pending' | 'issued' | 'revoked' | 'expired'
  }

  async revoke(sessionId: string): Promise<void> {
    // Call your provider's revocation API
  }
}
```

## 3. Add provider-specific endpoints (optional)

If your provider uses callbacks (like OAuth redirects), add them as public methods. See `VerID.callback()` for an example:

```ts
export class MyProvider extends Provider<MyProviderConfig, MyProviderAttestationConfig> {
  // ... issue, status, revoke ...

  async callback(params: URLSearchParams): Promise<{ success: boolean; sessionId: string; context: SessionContext }> {
    // Validate callback parameters
    // Look up session state via this.session
    // Emit an issuance event to notify the consumer
    await this.emitIssuanceEvent({
      sessionId: '...',
      status: 'issued',
      context: { source: '...', id: '...', attestation: '...' },
    });

    return { success: true, sessionId: '...', context: { source: '...', id: '...', attestation: '...' } };
  }
}
```

## 4. Export from barrel

```ts
// src/providers/index.ts
export { MyProvider } from './MyProvider';
export type { MyProviderConfig, MyProviderAttestationConfig } from './MyProvider';
```

## 5. Use it

```ts
const arc = new ARC({
  provider: new MyProvider(
    { apiUrl: '...', apiKey: '...' },
    { 'standplaatsvergunning': { templateId: 'tmpl-123' } },
  ),
  // ...
});
```

The consumer accesses provider-specific endpoints via `arc.provider.callback(params)`. ARC's generic type parameter preserves the concrete type so these methods are fully typed.
