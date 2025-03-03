import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString, IsArray, ValidateNested, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class ColumnPositionInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field(() => Int)
  @IsNumber()
  position: number;
}

@InputType()
export class UpdateColumnPositionsInput {
  @Field(() => [ColumnPositionInput])
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ColumnPositionInput)
  columns: ColumnPositionInput[];
}
