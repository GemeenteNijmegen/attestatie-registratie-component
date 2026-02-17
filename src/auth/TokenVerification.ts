import * as jwt from 'jsonwebtoken';

export class TokenVerification {
  private readonly secret: string;

  constructor(jwtSecret: string) {
    this.secret = jwtSecret;
    if (!this.secret) {
      throw new Error('JWT secret is not set');
    }
  }

  verify(token: string): string | jwt.JwtPayload {
    return jwt.verify(token, this.secret);
  }
}
