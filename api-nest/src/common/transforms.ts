import { TransformFnParams } from 'class-transformer';

// '' and null mean "not given", so @IsOptional() skips them
export const toNumber = ({ value }: TransformFnParams) =>
  value === '' || value === null || value === undefined ? undefined : Number(value);

// numeric columns without a scale keep every digit, so prices are rounded to cents first
export const toCents = (params: TransformFnParams) => {
  const number = toNumber(params);
  return number === undefined ? undefined : Math.round(number * 100) / 100;
};

export const trim = ({ value }: TransformFnParams) => (typeof value === 'string' ? value.trim() : value);

// optional text: blank becomes null, so the column is cleared instead of holding ''
export const trimToNull = ({ value }: TransformFnParams) => {
  if (typeof value !== 'string') return value;
  return value.trim() || null;
};
