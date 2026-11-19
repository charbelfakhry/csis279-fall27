import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getRequest } from '../common/get-request.js';
import { PermissionsRepository } from './permissions.repository.js';
import { PERMISSIONS_KEY } from './require-permissions.decorator.js';

// runs after AuthGuard. permissions are read from the database (not the token),
// so a removed permission stops working right away instead of when the token expires.
// 401 = we don't know who you are, 403 = we know, but you're not allowed
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsRepository: PermissionsRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[] | undefined>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    const request = getRequest(context);
    request.permissions ??= new Set(await this.permissionsRepository.findCodesByUserId(request.userId));

    if (!required.every((code) => request.permissions!.has(code))) {
      throw new ForbiddenException("You don't have permission to do this");
    }
    return true;
  }
}
