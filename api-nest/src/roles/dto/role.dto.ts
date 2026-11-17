import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { trim, trimToNull } from '../../common/transforms.js';

const PERMISSIONS_MESSAGE = 'Permissions must be a list of permission codes';

export class RoleDto {
  @Transform(trim)
  @IsString({ message: 'Name is required' })
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(50, { message: 'Name must be at most 50 characters' })
  name: string;

  @IsOptional()
  @Transform(trimToNull)
  @IsString({ message: 'Description must be text' })
  description?: string | null;

  // defaults to false when not sent
  @IsOptional()
  @IsBoolean({ message: 'isDefault must be true or false' })
  isDefault?: boolean;

  // whether each code exists is checked against the database by the service
  @Transform(({ value }) => (Array.isArray(value) ? [...new Set(value)] : value))
  @IsArray({ message: PERMISSIONS_MESSAGE })
  @IsString({ each: true, message: PERMISSIONS_MESSAGE })
  permissions: string[];
}
