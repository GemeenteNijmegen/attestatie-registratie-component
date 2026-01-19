// import productResponse from '../../test/resources/product.json';
// import { Case } from '../Case';
// import standplaatsvergunningConfig from '../standplaatsvergunning.json';

// describe('Case', () => {
//   let standplaatsvergunningCase: Case;

//   beforeEach(() => {
//     standplaatsvergunningCase = new Case(standplaatsvergunningConfig as any);
//   });

//   describe('convert', () => {
//     it('should convert product response to credential attributes', () => {
//       const result = standplaatsvergunningCase.convert(productResponse);

//       expect(result).toHaveLength(9);
//       expect(result[0]).toEqual({
//         attributeId: 'geldig_van',
//         value: ['2026-01-19']
//       });
//       expect(result[1]).toEqual({
//         attributeId: 'geldig_tot',
//         value: ['2026-01-21']
//       });
//       expect(result[2]).toEqual({
//         attributeId: 'locatie',
//         value: ['Korte Nieuwstraat 6 6511 PP NIJMEGEN']
//       });
//       expect(result[3]).toEqual({
//         attributeId: 'typeLocatie',
//         value: ['standplaatsvergunning']
//       });
//       expect(result[4]).toEqual({
//         attributeId: 'kenmerk',
//         value: ['12126e1e-9bc1-4a30-b73e-5b5aa4ce8bc4']
//       });
//       expect(result[5]).toEqual({
//         attributeId: 'bsn',
//         value: ['999999333']
//       });
//       expect(result[6]).toEqual({
//         attributeId: 'uniforme_product_naam',
//         value: ['standplaatsvergunning']
//       });
//       expect(result[7]).toEqual({
//         attributeId: 'product_code',
//         value: ['TEST-4D']
//       });
//       expect(result[8]).toEqual({
//         attributeId: 'product_naam',
//         value: ['Test product via API']
//       });
//     });
//   });
// });

test('skiped', () => { });