import * as product from '../test/resources/product.json';

export interface Product {
  readonly uuid: string;
  readonly naam: string;
  readonly producttype: {
    readonly code: string;
    readonly uniforme_product_naam: string;
  };
  readonly dataobject: {
    readonly location: string;
  };
  readonly eind_datum: string;
  readonly start_datum: string;
  readonly eigenaren: {
    readonly bsn: string;
  }[];
}

export class ProductenService {

  async getProduct(_productUuid: string): Promise<Product> {
    return product as Product;
  }
}
