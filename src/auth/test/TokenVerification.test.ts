import * as jwt from 'jsonwebtoken';
import { TokenVerification } from '../TokenVerification';

describe('TokenVerification Integration', () => {
  let verifier: TokenVerification;
  const secret = 'secret';

  beforeEach(() => {
    verifier = new TokenVerification(secret);
  });

  it('should verify a valid token and return payload', () => {
    const payload = { product: 'vergunning' };
    const token = jwt.sign(payload, secret);

    const result = verifier.verify(token) as jwt.JwtPayload;

    expect(result).toBeDefined();
    expect(result.product).toBe(payload.product);
  });

  it('should throw error for token signed with different secret', () => {
    const payload = { product: 'vergunning' };
    const token = jwt.sign(payload, 'wrong-secret');

    expect(() => verifier.verify(token)).toThrow();
  });

  it('should throw error for expired token', () => {
    const payload = { product: 'vergunning' };
    const token = jwt.sign({ ...payload, exp: Math.floor(Date.now() / 1000) - 100 }, secret);

    expect(() => verifier.verify(token)).toThrow();
  });
});
