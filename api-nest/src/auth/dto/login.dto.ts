import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { trim } from '../../common/transforms.js';

@InputType('LoginInput')
export class LoginDto {
  @Field()
  @Transform(trim)
  @IsString({ message: 'Email is required' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @Field()
  @IsString({ message: 'Password is required' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
