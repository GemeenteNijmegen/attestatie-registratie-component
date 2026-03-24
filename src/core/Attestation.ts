import { MappingResult } from '../schemas';

export interface AttestationOptions {
  name: string;
  sourceName: string;
  sourceIdentifier: string;
  sourceIdentifierPath: string;
}

export abstract class Attestation<TSource = unknown> {
  readonly name: string;
  readonly sourceName: string;
  readonly sourceIdentifier: string;
  readonly sourceIdentifierPath: string;

  constructor(protected readonly options: AttestationOptions) {
    this.name = options.name;
    this.sourceName = options.sourceName;
    this.sourceIdentifier =  options.sourceIdentifier;
    this.sourceIdentifierPath = options.sourceIdentifierPath;
  }

  abstract map(input: TSource): MappingResult;
}
