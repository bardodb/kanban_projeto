import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class MoveCardInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  cardId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  fromColumnId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  toColumnId: string;

  @Field(() => Int)
  @IsNumber()
  position: number;
}
