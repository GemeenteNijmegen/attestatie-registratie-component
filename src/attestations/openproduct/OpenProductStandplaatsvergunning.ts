import { Attestation } from "../../core/Attestation";
import { MappingValidationError } from "../../errors";
import { MappingResult } from "../../schemas";
import { Product } from "../../sources/OpenProduct";

export class OpenProductStandplaatsvergunning extends Attestation<Product> {
  constructor() {
    super({
      name: "standplaatsvergunning",
      sourceName: "openproduct",
      sourceIdentifier: "standplaatsvergunning",
      sourceIdentifierPath: "producttype.uniforme_product_naam",
    });
  }

  map(product: Product): MappingResult {
    const bsn = product.eigenaren[0]?.bsn;
    const eind_datum = product.eind_datum ?? "";
    const start_datum = product.start_datum ?? "";
    const locatie =
      (product.dataobject?.location as string) ?? "locatie onbekend";

    if (!bsn || !product.uuid) {
      throw new MappingValidationError("standplaatsvergunning");
    }

    return {
      typeLocatie: "onbekend",
      product_naam: product.naam,
      bsn: bsn,
      uniforme_product_naam: product.producttype.uniforme_product_naam,
      locatie: locatie,
      product_code: product.producttype.code,
      geldig_van: start_datum,
      geldig_tot: eind_datum,
      kenmerk: product.uuid,
    };
  }
}
