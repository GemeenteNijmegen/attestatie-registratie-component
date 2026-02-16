
import { VerIdAttestationService } from '../attestation-service/VerIdAttestationService';
import { AttestatieRegestratieComponent } from '../AttestationRegistrationComponent';
import { AttestationRequest } from '../AttestationRequest';
import { TokenVerification } from '../auth/TokenVerification';
import { Product } from '../producten/ProductenService';

// Keep this for later use as it works...
// jest.mock('@ver-id/node-client', () => ({
//   VeridIssuanceClient: jest.fn().mockImplementation(() => ({
//     createIssuanceIntent: jest.fn(),
//     generateIssuanceUrl: jest.fn(),
//     generateCodeChallenge: jest.fn().mockImplementation(() => {
//       return Promise.resolve({
//         codeChallenge: 'codeChallenge',
//         state: 'state',
//       });
//     }),
//   })),
// }));

jest.mock('../attestation-service/VerIdAttestationService', () => ({
  VerIdAttestationService: jest.fn().mockImplementation(() => {
    return {
      intent: jest.fn().mockImplementation(() => {
        return Promise.resolve('http://example.com');
      }),
    };
  }),
}));

jest.mock('../auth/TokenVerification', () => ({
  TokenVerification: jest.fn().mockImplementation(() => ({
    verify: jest.fn(),
  })),
}));

describe('AttestatieRegestratieComponent', () => {
  let component: AttestatieRegestratieComponent;
  let mockedAttestationService: VerIdAttestationService;
  let mockedProductenService: any;

  beforeEach(() => {
    mockedAttestationService = new VerIdAttestationService({
      client_id: '',
      client_secret: '',
      issuerUri: '',
      redirectUri: '',
    });
    const mockedProduct: Product = {
      uuid: '123e4567-e89b-12d3-a456-426614174000',
      naam: 'Test Product',
      producttype: {
        code: 'TEST',
        uniforme_product_naam: 'Test Product',
      },
      dataobject: {
        location: 'Test Location',
      },
      eind_datum: '2022-12-31',
      start_datum: '2022-01-01',
      eigenaren: [
        {
          bsn: '123456789',
        },
      ],
    };
    mockedProductenService = {
      getProduct: jest.fn().mockImplementation(() => {
        return Promise.resolve(mockedProduct);
      }),
    };
    component = new AttestatieRegestratieComponent({
      attestationService: mockedAttestationService,
      productenService: mockedProductenService,
    });
  });

  describe('start', () => {
    it('should handle request', async () => {
      const request = {
        token: 'valid-token',
      } as AttestationRequest;
      await expect(component.start(request)).resolves.toBe('http://example.com');
    });

    it('should throw error when token is missing', async () => {
      const request = {} as AttestationRequest;
      await expect(component.start(request)).rejects.toThrow('Authentication token is missing');
    });

    it('should throw error when token is invalid', async () => {
      const request = {
        token: 'invalid-token',
      } as AttestationRequest;

      const MockedTokenVerification = TokenVerification as jest.Mock<TokenVerification>;
      const mockVerify = jest.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      });
      MockedTokenVerification.mockImplementation(() => ({
        verify: mockVerify,
      } as unknown as TokenVerification));

      // Re-instantiate component to pick up new mock
      const componentWithInvalidToken = new AttestatieRegestratieComponent({
        attestationService: mockedAttestationService,
        productenService: mockedProductenService,
      });

      await expect(componentWithInvalidToken.start(request)).rejects.toThrow('Invalid token');
    });
  });

  describe('callback', () => {
    it('should handle request', async () => {
      const request = {} as AttestationRequest;
      await expect(component.callback(request)).resolves.toBeTruthy();
    });
  });
});
