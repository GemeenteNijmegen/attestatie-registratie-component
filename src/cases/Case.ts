import { query } from 'jsonpath';
import { CredentialAttribute } from '../attestation-service/AttestationService';

export interface CaseConfig {
  id: string;
  input: 'producten';
  credential: CredentialAttribute[];
}

export class Case {

  constructor(readonly config: CaseConfig) { }

  convert(input: any) {
    return this.config.credential.map(attribute => {
      return {
        ...attribute,
        value: query(input, attribute.value),
      };
    });
  }

}