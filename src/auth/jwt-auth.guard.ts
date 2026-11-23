import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }
    try {
      const payload = this.jwtService.verify(auth.slice(7));
      req.user = { id: payload.sub, role: payload.role }; // Attach user to request
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}