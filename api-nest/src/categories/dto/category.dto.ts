import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { trim, trimToNull } from '../../common/transforms.js';

// the REST body and the GraphQL input are the same class, so the rules live in one place
@InputType('CategoryInput')
export class CategoryDto {
  @Field()
  @Transform(trim)
  @IsString({ message: 'Name is required' })
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(100, { message: 'Name must be at most 100 characters' })
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Transform(trimToNull)
  @IsString({ message: 'Description must be text' })
  description?: string | null;

  // defaults to true when not sent
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be true or false' })
  isActive?: boolean;
}
