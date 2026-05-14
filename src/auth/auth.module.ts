import { Module } from '@nestjs/common';

import { APP_GUARD } from '@nestjs/core';

import { JwtModule } from '@nestjs/jwt';

import { PassportModule } from '@nestjs/passport';

import { ConfigModule, ConfigService } from '@nestjs/config';

import { PrismaModule } from '../prisma/prisma.module';

import { RedisModule } from '../redis/redis.module';

import { AuthController } from './auth.controller';

import { AuthService } from './auth.service';

import { RateLimitService } from './services/rate-limit';

import { EmailVerificationService } from './services/email-verification..service';

import { TokenService } from './services/token.service';

import { SessionService } from './services/session.service';

import { JwtStrategy } from './strategies/jwt.strategy';

import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

// import { JwtAuthGuard } from './guards/auth.guard';
import { JwtAuthGuard } from './auth.guard';

@Module({
  imports: [
    PrismaModule,

    RedisModule,

    ConfigModule,

    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    JwtModule.registerAsync({
      inject: [ConfigService],

      useFactory: (
        configService: ConfigService,
      ) => ({
        secret:
          configService.get<string>(
            'JWT_ACCESS_SECRET',
          ),

        signOptions: {
          expiresIn: '15m',
        },
      }),
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,

    RateLimitService,

    EmailVerificationService,

    TokenService,

    SessionService,

    JwtStrategy,

    RefreshTokenStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],

  exports: [AuthService],
})
export class AuthModule {}