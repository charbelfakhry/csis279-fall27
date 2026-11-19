import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { AuthenticatedRequest } from '../../common/authenticated-request.js';
import { AuthService } from '../auth.service.js';
import { LoginDto } from '../dto/login.dto.js';
import { RegisterDto } from '../dto/register.dto.js';
import { Public } from '../public.decorator.js';
import { AuthPayloadType, SessionUserType } from './auth.types.js';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => AuthPayloadType)
  register(@Args('input') input: RegisterDto) {
    return this.authService.register(input);
  }

  @Public()
  @Mutation(() => AuthPayloadType)
  login(@Args('input') input: LoginDto) {
    return this.authService.login(input.email, input.password);
  }

  @Query(() => SessionUserType)
  me(@Context('req') request: AuthenticatedRequest) {
    return this.authService.getCurrentUser(request.userId);
  }
}
