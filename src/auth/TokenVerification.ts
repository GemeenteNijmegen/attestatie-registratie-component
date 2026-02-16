import * as jwt from 'jsonwebtoken';

export class TokenVerification {
  private readonly secret: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'secret';
  }

  verify(token: string): string | jwt.JwtPayload {
    if (!process.env.JWT_SECRET) {
      console.warn('Warning: JWT_SECRET is not set, using default "secret"');
    }
    return jwt.verify(token, this.secret);
  }
}
