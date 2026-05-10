import {
  CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ROLES_KEY, type StaffRole } from './roles.decorator';

interface JwtPayload {
  sub: string;
  role: StaffRole;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private jwt: JwtService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    const token = header.slice(7);

    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    (req as any).user = payload;

    // No @Roles() metadata → admin-only by default. Fail closed.
    const required = this.reflector.getAllAndOverride<StaffRole[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? ['admin'];

    if (!required.includes(payload.role)) {
      throw new ForbiddenException(`Requires role: ${required.join(' | ')}`);
    }
    return true;
  }
}
