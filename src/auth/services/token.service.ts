import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';


export interface SessionPayload {
  userId : number;
  email : string;
  sessionId : string;
}

@Injectable()
export class TokenService {
  constructor(private readonly jwt: JwtService) {}

  async generateAccessToken(payload: SessionPayload): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });
  }

  async generateRefreshToken(payload: SessionPayload): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });
  }

  async verifyAccessToken(token: string): Promise<SessionPayload> {
    return this.jwt.verifyAsync(token, {
      secret: process.env.JWT_SECRET,
    });
  }

  async verifyRefreshToken(token: string): Promise<SessionPayload> {
    return this.jwt.verifyAsync(token, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
  }
}
