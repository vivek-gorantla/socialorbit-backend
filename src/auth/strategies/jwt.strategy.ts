import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy as JwtStrategyBase } from 'passport-jwt';

import { ConfigService } from '@nestjs/config';

import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(
    JwtStrategyBase,
    'jwt',
) {
    constructor(
        configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        super({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,

            secretOrKey: configService.get<string>(
                'JWT_ACCESS_SECRET',
            ),
        });
    }

    async validate(payload: any) {
        /**
         * payload contains:
         * {
         *   userId,
         *   email,
         *   sessionId
         * }
         */

        const session =
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            await this.authService.validateSession(payload.sessionId);

        if (!session) {
            throw new UnauthorizedException(
                'Invalid session',
            );
        }

        return {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            userId: payload.userId,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            email: payload.email,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            sessionId: payload.sessionId,
        };
    }
}