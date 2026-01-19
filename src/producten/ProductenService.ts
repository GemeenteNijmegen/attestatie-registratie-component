import * as product from '../test/resources/product.json';

export class ProductenService {

  async getProduct(_productUuid: string) {
    return product;
  }

}

