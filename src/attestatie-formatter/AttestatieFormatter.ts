import { CredentialMapping } from '../attestation-service/AttestationService';
import { OverlijdensakteAttestatieFormatter } from './OverlijdensakteAttestatieFormatter';
import { StandplaatsvergunningAttestatieFormatter } from './StandplaatsvergunningAttestatieFormatter';

/**
 * Allows us to define multiple product types
 * Goal is to make this extensible using external configuration
 */
export class AttestatieFormatter {

  static format(template: string, input: any): CredentialMapping {
    const formatter = this.types[template];
    if (!formatter) {
      throw new Error(`Unknown template: ${template}`);
    }
    return formatter().format(input);
  }

  static getFlowUuid(template: string) {
    const formatter = this.types[template];
    if (!formatter) {
      throw new Error(`Unknown template: ${template}`);
    }
    return formatter().getFlowUuid();
  }

  private static types: Record<string, () => IAttestatieFormatter<any>> = {
    standplaatsvergunning: () => new StandplaatsvergunningAttestatieFormatter(),
    overlijdensacte: () => new OverlijdensakteAttestatieFormatter(),
  };

}

/**
 * Interface for mapping inputs to attestations
 */
export interface IAttestatieFormatter<T> {
  format(input: T): CredentialMapping;
  getFlowUuid(): string;
}
