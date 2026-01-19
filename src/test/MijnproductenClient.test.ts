import { randomUUID } from 'node:crypto';
import { ProductenService } from '../producten/ProductenService';

test('Load product', async () => {
  const client = new ProductenService();
  expect((await client.getProduct(randomUUID())).uuid).toEqual('12126e1e-9bc1-4a30-b73e-5b5aa4ce8bc4');
});