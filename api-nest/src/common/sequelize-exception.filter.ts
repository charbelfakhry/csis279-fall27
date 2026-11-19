import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { GqlContextType } from '@nestjs/graphql';
import { Response } from 'express';
import { BaseError, DatabaseError, ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize';

// postgres error codes that are the client's fault, for errors no service handled itself
const invalidInput: Record<string, string> = {
  '22P02': 'Invalid value', // bad text for a number column
  '22003': 'Number is out of range',
};

const pgCode = (error: BaseError) =>
  error instanceof DatabaseError ? (error.parent as { code?: string }).code : undefined;

const toStatus = (error: BaseError): [number, string] => {
  if (error instanceof UniqueConstraintError) return [HttpStatus.CONFLICT, 'This value already exists'];
  if (error instanceof ForeignKeyConstraintError) return [HttpStatus.CONFLICT, 'This record is still used by other records'];
  const code = pgCode(error);
  if (code && invalidInput[code]) return [HttpStatus.BAD_REQUEST, invalidInput[code]];
  console.error(error);
  return [HttpStatus.INTERNAL_SERVER_ERROR, 'Internal server error'];
};

// services turn the errors they expect into specific messages ("A category with this
// name already exists"); this is the fallback, so a database error is never a bare 500
@Catch(BaseError)
export class SequelizeExceptionFilter implements ExceptionFilter {
  catch(error: BaseError, host: ArgumentsHost) {
    const [status, message] = toStatus(error);

    // GraphQL has no response object to write to: returning the exception
    // lets Apollo put it in the "errors" array of the reply
    if (host.getType<GqlContextType>() === 'graphql') {
      return new HttpException({ statusCode: status, message }, status);
    }
    host.switchToHttp().getResponse<Response>().status(status).json({ message });
  }
}
