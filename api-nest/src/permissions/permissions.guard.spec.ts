import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard.js';

const contextFor = (request: object) =>
  ({
    getType: () => 'http',
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

describe('PermissionsGuard', () => {
  const reflector = { getAllAndOverride: vi.fn() } as unknown as Reflector & { getAllAndOverride: ReturnType<typeof vi.fn> };
  const repo = { findCodesByUserId: vi.fn() };
  const guard = new PermissionsGuard(reflector, repo as never);

  beforeEach(() => vi.resetAllMocks());

  it('allows routes without required permissions', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    await expect(guard.canActivate(contextFor({}))).resolves.toBe(true);
    expect(repo.findCodesByUserId).not.toHaveBeenCalled();
  });

  it('allows a user with every required permission', async () => {
    reflector.getAllAndOverride.mockReturnValue(['products:read']);
    repo.findCodesByUserId.mockResolvedValue(['products:read', 'products:create']);
    await expect(guard.canActivate(contextFor({ userId: 1 }))).resolves.toBe(true);
  });

  it('rejects a user missing a permission with 403', async () => {
    reflector.getAllAndOverride.mockReturnValue(['products:delete']);
    repo.findCodesByUserId.mockResolvedValue(['products:read']);
    await expect(guard.canActivate(contextFor({ userId: 1 }))).rejects.toBeInstanceOf(ForbiddenException);
  });
});
