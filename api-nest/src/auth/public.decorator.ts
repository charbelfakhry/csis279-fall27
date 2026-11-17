import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

// every route needs a token unless it is marked @Public()
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
