import { GraphQLFormattedError } from 'graphql';

const CODES: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
};

// what Nest puts in extensions.originalError when a resolver throws an HttpException
interface NestError {
  statusCode?: number;
  errors?: string[]; // from the ValidationPipe in setup.ts
}

// turns Nest's HTTP errors into clean GraphQL errors: the real message,
// a code the client can switch on, and no stack trace
export function formatGraphqlError(formatted: GraphQLFormattedError): GraphQLFormattedError {
  const original = formatted.extensions?.originalError as NestError | undefined;
  const { path, locations } = formatted;

  if (original?.errors) {
    return { message: original.errors.join(', '), path, locations, extensions: { code: 'BAD_REQUEST', errors: original.errors } };
  }
  if (original?.statusCode && CODES[original.statusCode]) {
    return { message: formatted.message, path, locations, extensions: { code: CODES[original.statusCode] } };
  }
  // anything unexpected: don't show the client what went wrong inside the server
  if (formatted.extensions?.code === 'INTERNAL_SERVER_ERROR') {
    return { message: 'Internal server error', path, locations, extensions: { code: 'INTERNAL_SERVER_ERROR' } };
  }
  return { message: formatted.message, path, locations, extensions: { code: formatted.extensions?.code } };
}
