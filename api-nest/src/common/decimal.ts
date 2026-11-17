// postgres returns numeric columns as strings (to keep their precision); the API sends numbers
export const toFloat = (value: unknown) => (value === null || value === undefined ? value : Number(value));
