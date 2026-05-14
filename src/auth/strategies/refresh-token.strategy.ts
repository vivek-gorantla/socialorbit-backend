import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';

import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';

import { Request } from 'express';

import { ConfigService } from '@nestjs/config';

import { TokenService } from '../services/token.service';

import { AuthService } from '../auth.service';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,

    private readonly tokenService: TokenService,

    private readonly authService: AuthService,
  ) {
    const secret =
      configService.get<string>(
        'JWT_REFRESH_SECRET',
      );

    if (!secret) {
      throw new Error(
        'JWT_REFRESH_SECRET missing',
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      jwtFromRequest:
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      secretOrKey: secret,

      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: any,
  ) {
    const refreshToken =
      req.headers.authorization
        ?.replace('Bearer', '')
        .trim();

    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const session =
      await this.authService.validateSession(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        payload.sessionId,
      );

    if (!session) {
      throw new UnauthorizedException(
        'Session invalid',
      );
    }

    /**
     * Verify refresh token hash
     */
    const isValid = await this.tokenService.verifyRefreshToken(refreshToken);

    if (!isValid) {
      await this.authService.revokeSession(
        session.sessionId,
      );

      throw new UnauthorizedException(
        'Refresh token reuse detected',
      );
    }

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      userId: payload.sub,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      email: payload.email,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      sessionId: payload.sessionId,
      refreshToken,
    };
  }
}