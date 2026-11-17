import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { BaseError, DatabaseError, ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize';

// postgres error codes that are the client's fault, for errors no service handled itself
const invalidInput: Record<string, string> = {
  '22P02': 'Invalid value', // bad text for a number column
  '22003': 'Number is out of range',
};

const pgCode = (error: BaseError) =>
  error instanceof DatabaseError ? (error.parent as { code?: string }).code : undefined;

// services turn the errors they expect into specific messages ("A category with this
// name already exists"); this is the fallback, so a database error is never a bare 500
@Catch(BaseError)
export class SequelizeExceptionFilter implements ExceptionFilter {
  catch(error: BaseError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (error instanceof UniqueConstraintError) {
      return response.status(HttpStatus.CONFLICT).json({ message: 'This value already exists' });
    }
    if (error instanceof ForeignKeyConstraintError) {
      return response.status(HttpStatus.CONFLICT).json({ message: 'This record is still used by other records' });
    }

    const code = pgCode(error);
    if (code && invalidInput[code]) {
      return response.status(HttpStatus.BAD_REQUEST).json({ message: invalidInput[code] });
    }

    console.error(error);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
}
