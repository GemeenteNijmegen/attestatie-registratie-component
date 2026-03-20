import { ProductenService } from './ProductenService';
import { Product, ProductSchema } from './ProductSchema';

export interface OpenProductApiConfig {
  readonly baseUrl: string;
  readonly apiToken: string;
}

export class OpenProductApiService implements ProductenService {
  constructor(private readonly config: OpenProductApiConfig) { }

  async getProduct(productUuid: string): Promise<Product> {

    const url = `${this.config.baseUrl}/producten/${productUuid}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Token ${this.config.apiToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
    }

    try {
      const data = await response.json();
      return ProductSchema.parse(data);
    } catch (error) {
      console.error('Failed to parse response', error);
      throw new Error('Failed to parse product response');
    }
  }
}
