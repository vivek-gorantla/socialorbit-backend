import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserAuth } from '../generated/prisma/client';

export type User = any;

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async createUser(user: UserAuth) {
    return this.prismaService.userAuth.create({ data: user });
  }

  async findOne(username: string): Promise<User | null> {
    return this.prismaService.userAuth.findUnique({ where: { username } });
  }
}
