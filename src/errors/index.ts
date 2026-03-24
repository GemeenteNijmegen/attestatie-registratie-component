/**
 * ARC Error hierarchy
 *
 * All errors thrown by ARC extend ARCError and carry a numeric error code.
 * Consumers can catch specific error classes or inspect the code programmatically.
 *
 * Code ranges:
 *   1xxx — Generic errors (not implemented, unknown)
 *   2xxx — Configuration errors (invalid setup, missing references)
 *   3xxx — Source errors (fetch, parse)
 *   4xxx — Mapping errors (invalid source data for attestation)
 *   5xxx — Provider errors (issuance, callback)
 *   6xxx — Store errors (not found, expired)
 *   7xxx — Session errors (callback state)
 */

// ---------------------------------------------------------------------------
// Base
// ---------------------------------------------------------------------------

export class ARCError extends Error {
  public readonly code: number;
  public readonly cause?: unknown;

  constructor(message: string, code: number, options?: { cause?: unknown }) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.cause = options?.cause;
  }
}

// ---------------------------------------------------------------------------
// 1xxx — Generic
// ---------------------------------------------------------------------------

/** Method or feature is not yet implemented. */
export class NotImplementedError extends ARCError {
  constructor(method: string) {
    super(`${method} not yet implemented`, 1001);
  }
}

/** Catch-all for unexpected errors. */
export class UnknownError extends ARCError {
  constructor(message: string, cause?: unknown) {
    super(message, 1002, { cause });
  }
}

// ---------------------------------------------------------------------------
// 2xxx — Configuration
// ---------------------------------------------------------------------------

export class ConfigurationError extends ARCError {
  constructor(message: string, code: number = 2000, options?: { cause?: unknown }) {
    super(message, code, options);
  }
}

/** Attestation references a source that is not registered. */
export class UnknownSourceError extends ConfigurationError {
  constructor(source: string) {
    super(`Unknown source: ${source}`, 2001);
  }
}

/** No matching attestation found for the given source data. */
export class UnknownAttestationError extends ConfigurationError {
  constructor(source: string) {
    super(`No matching attestation found for source "${source}"`, 2002);
  }
}

/** Provider has no configuration for the given attestation name. */
export class AttestationNotConfiguredError extends ConfigurationError {
  constructor(attestationName: string) {
    super(`No configuration for attestation "${attestationName}"`, 2003);
  }
}

/** Provider was used without being initialized via ARC (missing session). */
export class ProviderNotInitializedError extends ConfigurationError {
  constructor() {
    super('Session not configured — provider must be initialized via ARC', 2004);
  }
}

// ---------------------------------------------------------------------------
// 3xxx — Source
// ---------------------------------------------------------------------------

export class SourceError extends ARCError {
  constructor(message: string, code: number = 3000, options?: { cause?: unknown }) {
    super(message, code, options);
  }
}

/** Source returned a non-OK HTTP response. */
export class SourceFetchError extends SourceError {
  constructor(status: number, statusText: string) {
    super(`Failed to fetch product: ${status} ${statusText}`, 3001);
  }
}

/** Source response could not be parsed / validated. */
export class SourceParseError extends SourceError {
  constructor(cause?: unknown) {
    super('Failed to parse product response', 3002, { cause });
  }
}

// ---------------------------------------------------------------------------
// 4xxx — Mapping
// ---------------------------------------------------------------------------

export class MappingError extends ARCError {
  constructor(message: string, code: number = 4000, options?: { cause?: unknown }) {
    super(message, code, options);
  }
}

/** Source data is missing required fields for the attestation mapping. */
export class MappingValidationError extends MappingError {
  constructor(attestation: string) {
    super(`Invalid product: missing required fields for ${attestation}`, 4001);
  }
}

// ---------------------------------------------------------------------------
// 5xxx — Provider
// ---------------------------------------------------------------------------

export class ProviderError extends ARCError {
  constructor(message: string, code: number = 5000, options?: { cause?: unknown }) {
    super(message, code, options);
  }
}

/** Callback is missing a required parameter. */
export class CallbackError extends ProviderError {
  constructor(message: string, code: number = 5001) {
    super(message, code);
  }
}

// ---------------------------------------------------------------------------
// 6xxx — Store
// ---------------------------------------------------------------------------

export class StoreError extends ARCError {
  constructor(message: string, code: number = 6000, options?: { cause?: unknown }) {
    super(message, code, options);
  }
}

/** Item not found in store. */
export class StoreNotFoundError extends StoreError {
  constructor(id: string) {
    super(`Item with id "${id}" not found`, 6001);
  }
}

/** Item exists but has expired. */
export class StoreExpiredError extends StoreError {
  constructor(id: string) {
    super(`Item with id "${id}" has expired`, 6002);
  }
}

// ---------------------------------------------------------------------------
// 7xxx — Session
// ---------------------------------------------------------------------------

export class SessionError extends ARCError {
  constructor(message: string, code: number = 7000, options?: { cause?: unknown }) {
    super(message, code, options);
  }
}

/** Callback state not found or expired. */
export class CallbackStateNotFoundError extends SessionError {
  constructor(state: string) {
    super(`Unknown or expired callback state: ${state}`, 7001);
  }
}

/** Callback session record is corrupt (missing required fields). */
export class CallbackStateCorruptError extends SessionError {
  constructor(state: string) {
    super(`Corrupt callback session for state: ${state}`, 7002);
  }
}
