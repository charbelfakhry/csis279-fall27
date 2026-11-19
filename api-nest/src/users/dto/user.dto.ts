import { Field, InputType, Int } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { toNumber, trim } from '../../common/transforms.js';

const MAX_AGE = 150;
const AGE_MESSAGE = `Age must be a whole number between 0 and ${MAX_AGE}`;

// the profile fields, shared by the Users page and registration
@InputType('UserInput')
export class UserDto {
  @Field()
  @Transform(trim)
  @IsString({ message: 'First name is required' })
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @Field()
  @Transform(trim)
  @IsString({ message: 'Last name is required' })
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @Field()
  @Transform(trim)
  @IsString({ message: 'Email is required' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Transform(toNumber)
  @IsInt({ message: AGE_MESSAGE })
  @Min(0, { message: AGE_MESSAGE })
  @Max(MAX_AGE, { message: AGE_MESSAGE })
  age?: number | null;
}
