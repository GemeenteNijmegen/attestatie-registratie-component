import { VeridIssuanceClient } from '@ver-id/node-client';
import { CredentialAttribute } from '../AttestationService';
import { VerIdAttestationService } from '../VerIdAttestationService';

describe('VerIdAttestationService', () => {
  let verIdAttestationService: VerIdAttestationService;

  describe('intent', () => {
    it('should create an intent and return a url', async () => {
      const mockedIssuanceClient = {
        generateCodeChallenge: jest.fn().mockResolvedValue({
          codeChallenge: 'mock-code-challenge',
          state: 'mock-state',
        }),
        createIssuanceIntent: jest.fn().mockResolvedValue('mock-intent-id'),
        generateIssuanceUrl: jest.fn().mockResolvedValue({
          issuanceUrl: 'http://example.com',
        }),
      } as unknown as VeridIssuanceClient;

      verIdAttestationService = new VerIdAttestationService({
        client_id: '',
        client_secret: '',
        issuerUri: '',
        redirectUri: '',
      }, mockedIssuanceClient);

      await expect(verIdAttestationService.intent([{} as CredentialAttribute])).resolves.toBe('http://example.com');
      expect(mockedIssuanceClient.generateCodeChallenge).toHaveBeenCalled();
      expect(mockedIssuanceClient.createIssuanceIntent).toHaveBeenCalled();
      expect(mockedIssuanceClient.generateIssuanceUrl).toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should finalize the request and return the revocation key', async () => {
      const mockedIssuanceClient = {
        finalize: jest.fn().mockResolvedValue('mock-finalized-token'),
        decode: jest.fn().mockResolvedValue({
          payload: {
            output: [{ revocationKeys: 'mock-revocation-key' }],
          },
        }),
      } as unknown as VeridIssuanceClient;
      verIdAttestationService = new VerIdAttestationService({
        client_id: '',
        client_secret: 'secret',
        issuerUri: '',
        redirectUri: '',
      }, mockedIssuanceClient);
      // TODO: implement revocationKeys as response and test it
      await expect(verIdAttestationService.authorize({} as URLSearchParams)).resolves.toBe(undefined);
      expect(mockedIssuanceClient.finalize).toHaveBeenCalledWith({
        callbackParams: {},
        clientAuth: {
          client_secret: 'secret',
        },
      });
      expect(mockedIssuanceClient.decode).toHaveBeenCalled();
    });
  });
});
