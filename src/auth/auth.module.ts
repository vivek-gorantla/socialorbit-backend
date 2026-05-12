import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { RedisModule } from '../redis/redis.module';

import { AuthController } from './auth.controller';

import { AuthService } from './auth.service';

import { RateLimitService } from './services/rate-limit';

import { EmailVerificationService } from './services/email-verification..service';

import { TokenService } from './services/token.service';

import { SessionService } from './services/session.service';

import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule, RedisModule, JwtModule.register({})],

  controllers: [AuthController],

  providers: [
    AuthService,
    RateLimitService,
    EmailVerificationService,
    TokenService,
    SessionService,
  ],
})
export class AuthModule {}
