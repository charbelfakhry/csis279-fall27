import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { trim, trimToNull } from '../../common/transforms.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@InputType('SupplierInput')
export class SupplierDto {
  @Field()
  @Transform(trim)
  @IsString({ message: 'Name is required' })
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(100, { message: 'Name must be at most 100 characters' })
  name: string;

  @Field()
  @Transform(trim)
  @IsString({ message: 'Email is required' })
  @IsNotEmpty({ message: 'Email is required' })
  @Matches(EMAIL_PATTERN, { message: 'Email is invalid' })
  email: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Transform(trimToNull)
  @IsString({ message: 'Phone must be text' })
  phone?: string | null;
}
