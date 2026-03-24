import { randomUUID } from 'crypto';
import { VeridIssuanceClient } from '@ver-id/node-client';
import { CredentialMapping } from '../AttestationService';
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
        client_secret: '',
        issuerUri: '',
        redirectUri: '',
      }, mockedIssuanceClient);

      await expect(verIdAttestationService.intent({ mapping: {} } as CredentialMapping, 'mock-flow-uuid', randomUUID())).resolves.toEqual({
        issuanceUrl: 'http://example.com',
        issuanceRunId: undefined,
        state: 'mock-state',
      });
      expect(mockedIssuanceClient.generateCodeChallenge).toHaveBeenCalled();
      expect(mockedIssuanceClient.createIssuanceIntent).toHaveBeenCalled();
      expect(mockedIssuanceClient.generateIssuanceUrl).toHaveBeenCalled();
    });
  });

  describe('authorize', () => {

    /**
     * Not used as user is not guaranteed to receive this
     */
    xit('should finalize the request and return the revocation key', async () => {
      const mockedIssuanceClient = {
        finalize: jest.fn().mockResolvedValue('mock-finalized-token'),
        decode: jest.fn().mockResolvedValue({
          payload: {
            output: [{ revocationKeys: 'mock-revocation-key' }],
          },
        }),
      } as unknown as VeridIssuanceClient;
      verIdAttestationService = new VerIdAttestationService({
        client_secret: 'secret',
        issuerUri: '',
        redirectUri: '',
      }, mockedIssuanceClient);
      // TODO: implement revocationKeys as response and test it
      // await expect(verIdAttestationService.authorize({} as URLSearchParams)).rejects.toThrow('Not implemented');
    });
  });
});
