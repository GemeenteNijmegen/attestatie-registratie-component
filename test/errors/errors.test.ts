import {
  ARCError,
  ConfigurationError,
  UnknownSourceError,
  UnknownAttestationError,
  UnknownError,
  SourceError,
  SourceFetchError,
  SourceParseError,
  MappingValidationError,
  NotImplementedError,
  CallbackError,
  StoreNotFoundError,
  StoreExpiredError,
  CallbackStateNotFoundError,
  CallbackStateCorruptError,
  ProviderNotInitializedError,
  AttestationNotConfiguredError,
} from '../../src/errors';

describe('ARCError', () => {
  it('should set message, code, and name', () => {
    const error = new ARCError('test', 9999);

    expect(error.message).toBe('test');
    expect(error.code).toBe(9999);
    expect(error.name).toBe('ARCError');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ARCError);
  });

  it('should preserve cause', () => {
    const original = new Error('root cause');
    const error = new ARCError('wrapped', 9999, { cause: original });

    expect(error.cause).toBe(original);
  });

  it('should leave cause undefined when not provided', () => {
    const error = new ARCError('no cause', 9999);
    expect(error.cause).toBeUndefined();
  });
});

describe('hierarchy', () => {
  it.each([
    { Class: NotImplementedError, args: ['Status'], code: 1001, parent: ARCError },
    { Class: UnknownError, args: ['oops'], code: 1002, parent: ARCError },
    { Class: UnknownSourceError, args: ['src'], code: 2001, parent: ConfigurationError },
    { Class: UnknownAttestationError, args: ['src'], code: 2002, parent: ConfigurationError },
    { Class: AttestationNotConfiguredError, args: ['att'], code: 2003, parent: ConfigurationError },
    { Class: ProviderNotInitializedError, args: [], code: 2004, parent: ConfigurationError },
    { Class: SourceFetchError, args: [404, 'Not Found'], code: 3001, parent: SourceError },
    { Class: SourceParseError, args: [], code: 3002, parent: SourceError },
    { Class: MappingValidationError, args: ['standplaats'], code: 4001, parent: ARCError },
    { Class: CallbackError, args: ['Missing state'], code: 5001, parent: ARCError },
    { Class: StoreNotFoundError, args: ['abc'], code: 6001, parent: ARCError },
    { Class: StoreExpiredError, args: ['abc'], code: 6002, parent: ARCError },
    { Class: CallbackStateNotFoundError, args: ['xyz'], code: 7001, parent: ARCError },
    { Class: CallbackStateCorruptError, args: ['xyz'], code: 7002, parent: ARCError },
  ])('$Class.name should have code $code and extend $parent.name', ({ Class, args, code, parent }) => {
    const error = new (Class as any)(...args);

    expect(error.code).toBe(code);
    expect(error.name).toBe(Class.name);
    expect(error).toBeInstanceOf(ARCError);
    expect(error).toBeInstanceOf(parent);
    expect(error).toBeInstanceOf(Error);
  });
});
