
export interface AttestationService {
  /**
   * @returns The url to redirect the user to for a oauth flow
   */
  intent(payload: any): Promise<string>;
  /**
   * Calls the oauth service that attested for us and check if the session is succesful
   * @param code
   */
  authorize(params: URLSearchParams): Promise<void>;
}

/**
 * A list of attributes we want to issue
 */
export interface CredentialAttribute {
  attributeUuid: string;
  value: string;
}