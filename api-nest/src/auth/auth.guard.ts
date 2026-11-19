import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { getRequest } from '../common/get-request.js';
import { IS_PUBLIC_KEY } from './public.decorator.js';

// expects "Authorization: Bearer <token>" and sets request.userId
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = getRequest(context);
    const [scheme, token] = (request.headers.authorization ?? '').split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Please log in to continue');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: number }>(token);
      request.userId = payload.sub;
    } catch {
      throw new UnauthorizedException('Your session has expired, please log in again');
    }
    return true;
  }
}
