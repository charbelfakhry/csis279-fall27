import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

// the user needs every code listed: @RequirePermissions('products:delete')
export const RequirePermissions = (...codes: string[]) => SetMetadata(PERMISSIONS_KEY, codes);
