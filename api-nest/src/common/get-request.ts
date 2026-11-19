import { ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { AuthenticatedRequest } from './authenticated-request.js';

// REST and GraphQL keep the request in different places; guards use this to find it
export function getRequest(context: ExecutionContext): AuthenticatedRequest {
  if (context.getType<GqlContextType>() === 'graphql') {
    return GqlExecutionContext.create(context).getContext().req;
  }
  return context.switchToHttp().getRequest();
}
