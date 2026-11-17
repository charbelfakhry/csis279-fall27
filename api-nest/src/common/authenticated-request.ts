import { Request } from 'express';

// set by AuthGuard; PermissionsGuard caches the user's permission codes on it
export interface AuthenticatedRequest extends Request {
  userId: number;
  permissions?: Set<string>;
}
