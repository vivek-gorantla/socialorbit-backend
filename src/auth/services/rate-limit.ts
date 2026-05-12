import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class RateLimitService {
  constructor(private readonly redis: RedisService) {}

  async checkLimit(email: string) {
    const key = `ratelimit:${email}`;
    const count = await this.redis.increment(key);
    if (count == 1) {
      this.redis.expire(key, 3600);
    }
    if (count > 5) {
      throw new HttpException(
        'Too many attempts. Try again after 1 hour',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
