import { Field, InputType } from '@nestjs/graphql';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { UserDto } from '../../users/dto/user.dto.js';

@InputType('RegisterInput')
export class RegisterDto extends UserDto {
  @Field()
  @IsString({ message: 'Password must be at least 8 characters' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(72, { message: 'Password must be at most 72 characters' }) // bcrypt ignores the rest
  password: string;
}
