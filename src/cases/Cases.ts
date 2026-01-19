import { Case } from './Case';
import * as standplaatsvergunningVierdaagse from './standplaatsvergunning.json';
/**
 * Has a list of know cases parsed from config files
 */
export class Cases {

  private readonly cases: Record<string, Case> = {};

  constructor() {
    this.cases.standplaatsvergunningVierdaagse = new Case(standplaatsvergunningVierdaagse as any);
  }

}