import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { randomBytes } from 'crypto';

@Injectable()
export class EmailVerificationService {
  constructor(private readonly redisService: RedisService) {}

  async generateToken(email: string) {
    const token = await randomBytes(32).toString('hex');
    await this.redisService.set(`verify:${token}`, email, 900);
    return token;
  }

  async verifyToken(token: string) {
    const email = await this.redisService.get(`verify:${token}`);
    if (!email) {
      throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    }
    await this.redisService.delete(`verify:${token}`);
    return email;
  }
}
