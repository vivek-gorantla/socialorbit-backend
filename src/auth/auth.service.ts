import { Injectable } from '@nestjs/common';

import * as argon2 from 'argon2';

import { PrismaService } from 'src/prisma/prisma.service';

import { RateLimitService } from './services/rate-limit';

import { EmailVerificationService } from './services/email-verification..service';
import { TokenService } from './services/token.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SessionPayload, SessionService } from './services/session.service';

import { RedisService } from 'src/redis/redis.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { access } from 'fs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rateLimit: RateLimitService,
    private readonly emailVerification: EmailVerificationService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly redis: RedisService,
  ) { }

  async register(body: RegisterDto) {
    try {
      await this.rateLimit.checkLimit(body.email);

      const existingUser = await this.prisma.userAuth.findUnique({
        where: {
          email: body.email,
        },
      });

      if (existingUser) {
        return {
          success: false,
          message: 'User already exists',
        };
      }

      const hashedPassword = await argon2.hash(body.password);

      const user = await this.prisma.userAuth.create({
        data: {
          email: body.email,
          username: body.username,
          password: hashedPassword,
        },
      });

      if (!user) {
        return {
          success: false,
          message: 'Registration failed. Try again!',
        };
      }

      const verificationToken = await this.emailVerification.generateToken(
        user.email,
      );

      console.log('Verification Token:', verificationToken);

      return {
        success: true,
        message: 'Registration successful. Verify email.',
      };
    } catch (error: any) {
      console.error(error);

      return {
        success: false,
        message: 'Something went wrong',
      };
    }
  }

  async verifyEmail(token: string) {
    try {
      const email = await this.emailVerification.verifyToken(token);

      const user = await this.prisma.userAuth.findUnique({
        where: {
          email: email,
        },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      if (user.isVerified) {
        return {
          success: false,
          message: 'Email already verified',
        };
      }

      await this.prisma.userAuth.update({
        where: {
          email: email,
        },
        data: {
          isVerified: true,
          isVerifiedAt: new Date(),
        },
      });

      return {
        success: true,
        message: 'Email verified successfully',
      };
    } catch (error) {
      console.error(error);

      return {
        success: false,
        message: 'Verification failed',
      };
    }
  }

  async login(body: LoginDto) {
    try {
      const user = await this.prisma.userAuth.findUnique({
        where: {
          email: body.email,
        },
      });

      if (!user) {
        return {
          success: false,
          message: 'Invalid credentials',
        };
      }

      const isPasswordValid = await argon2.verify(user.password, body.password);

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid credentials',
        };
      }

      const payload: SessionPayload = {
        sub: user.id,
        email: user.email,
        sessionId: '',
      };

      const accessToken = await this.tokenService.generateAccessToken(payload);

      const refreshToken =
        await this.tokenService.generateRefreshToken(payload);

      const session = await this.sessionService.createSession(
        user.id,
        refreshToken,
      );

      await this.redis.set(
        `session:${session.id}`,
        JSON.stringify({
          sessionId: session.id,
          userId: user.id,
          email: user.email,
          createdAt: new Date(),
        }),
        604800
      );

      return {
        success: true,

        message: 'Login successful',

        data: {
          accessToken,
          refreshToken,
          sessionId: session.id,
        },
      };
    } catch (error) {
      console.error(error);

      return {
        success: false,
        message: 'Login failed',
      };
    }
  }

  async refreshToken(body: RefreshTokenDto) {
    try {
      if (!body.refreshToken) {
        return {
          success: false,
          message: 'Refresh token is required',
        };
      }

      const decoded = await this.tokenService.verifyRefreshToken(body.refreshToken);
      const userId = decoded.sub;
      const email = decoded.email;
      const session = await this.sessionService.validateSession(userId, body.refreshToken);

      if (!session) {
        return {
          success: false,
          message: 'Invalid session',
        };
      }

      // delete old session and token
      await this.redis.delete(
        `session:${session.id}`
      );

      await this.redis.delete(
        `user_sessions:${userId}:${session.id}`
      );

      await this.sessionService.deleteSession(session.id);

      const payload: SessionPayload = {
        sub: decoded.sub,
        email: decoded.email,
        sessionId: '',
      };

      const newAccessToken = await this.tokenService.generateAccessToken(payload);
      const newRefreshToken = await this.tokenService.generateRefreshToken(payload);

      const newSession = await this.sessionService.createSession(userId, newRefreshToken);

      await this.redis.set(
        `session:${newSession.id}`,
        JSON.stringify({
          sessionId: newSession.id,
          userId: userId,
          email: email,
          createdAt: new Date(),
        }),
        604800
      );

      await this.redis.set(
        `user_sessions:${userId}:${newSession.id}`,
        "active",
        604800
      );

      return {
        success: true,
        message: 'token refreshed successfully',
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          sessionId: newSession.id,
        }
      }


    } catch (error: any) {
      return {
        success: false,
        message: 'Token refresh failed',
      }
    }
  }
}
