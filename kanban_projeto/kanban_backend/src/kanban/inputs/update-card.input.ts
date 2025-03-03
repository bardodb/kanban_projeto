import { Field, InputType } from '@nestjs/graphql';
import { IsHexColor, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateCardInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Field({ nullable: true })
  @IsString()
  @IsHexColor()
  @IsOptional()
  color?: string;
}
