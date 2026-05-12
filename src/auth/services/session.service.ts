import { Injectable } from '@nestjs/common';

import * as argon2 from 'argon2';

import { PrismaService } from 'src/prisma/prisma.service';

export interface CreateSessionPayload {
  id: string;
  userId: number;
  refreshToken: string;
}

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) { }

  async createSession(data:CreateSessionPayload) {
    const hashedRefreshToken = await argon2.hash(data.refreshToken);

    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + 7);

    return this.prisma.session.create({
      data: {
        id: data.id,
        userId: data.userId,
        refreshTokenHash: hashedRefreshToken,
        expiresAt,
      },
    });
  }

  async validateSession(userId: number, refreshToken: string) {
    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
      },
    });

    for (const session of sessions) {
      const isValid = await argon2.verify(
        session.refreshTokenHash,
        refreshToken,
      );

      if (isValid) {
        return session;
      }
    }

    return null;
  }

  async deleteSession(sessionId: string) {
    return this.prisma.session.delete({
      where: {
        id: sessionId,
      },
    });
  }

  async deleteAllUserSessions(userId: number) {
    return this.prisma.session.deleteMany({
      where: {
        userId: userId,
      },
    });
  }
}
