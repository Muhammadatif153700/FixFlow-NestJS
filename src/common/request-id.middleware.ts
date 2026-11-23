import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    // 1. Generate Request ID and attach
    const requestId = randomUUID();
    (req as any).requestId = requestId;
    res.setHeader('X-Request-Id', requestId);

    // 2. Timing for logging
    const start = Date.now();
    const { method, originalUrl } = req;

    // 3. Log when response finishes (includes rejected requests)
    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      this.logger.log(`${method} ${originalUrl} ${statusCode} - ${duration}ms [ReqID: ${requestId}]`);
    });

    next();
  }
}