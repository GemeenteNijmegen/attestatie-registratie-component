import { Product } from '../../producten/ProductSchema';
import { AttestatieFormatter } from '../AttestatieFormatter';

describe('AttestatieFormatter', () => {
  const mockProduct: Product = {
    uuid: '12126e1e-9bc1-4a30-b73e-5b5aa4ce8bc4',
    url: 'https://example.com/product',
    naam: 'Vergunning langs de 4-daagse route',
    start_datum: '2026-01-20',
    eind_datum: '2026-01-31',
    aanmaak_datum: '2026-01-19T14:51:20.505685+01:00',
    update_datum: '2026-01-19T14:51:20.505699+01:00',
    producttype: {
      uuid: 'e9522583-d61f-4232-8268-d1596a94bf2d',
      code: 'TEST-4D',
      uniforme_product_naam: 'standplaatsvergunning',
    },
    eigenaren: [
      {
        uuid: '1dbe98d5-118e-4143-8e24-f5c866efc799',
        bsn: '999999333',
      },
    ],
    dataobject: {
      location: 'St. Annastraat 250 6525 HA NIJMEGEN',
    },
  };

  it('should format standplaatsvergunning product correctly', () => {
    const result = AttestatieFormatter.format('standplaatsvergunning', mockProduct);

    expect(result.mapping).toBeDefined();
    expect(result.mapping.bsn).toBe('999999333');
    expect(result.mapping.kenmerk).toBe('12126e1e-9bc1-4a30-b73e-5b5aa4ce8bc4');
    expect(result.mapping.product_naam).toBe('Vergunning langs de 4-daagse route');
    expect(result.mapping.uniforme_product_naam).toBe('standplaatsvergunning');
  });

  it('should throw error for unknown template', () => {
    expect(() => AttestatieFormatter.format('unknown', mockProduct)).toThrow('Unknown template: unknown');
  });

  it('should throw error when bsn is missing', () => {
    const invalidProduct = { ...mockProduct, eigenaren: [] };
    expect(() => AttestatieFormatter.format('standplaatsvergunning', invalidProduct)).toThrow('Invalid product: missing required fields');
  });

  it('should throw error when uuid is missing', () => {
    const invalidProduct = { ...mockProduct, uuid: '' };
    expect(() => AttestatieFormatter.format('standplaatsvergunning', invalidProduct)).toThrow('Invalid product: missing required fields');
  });
});
