import { Field, ObjectType } from '@nestjs/graphql';
import { Column } from './column.model';

@ObjectType()
export class Board {
  @Field(() => [Column])
  columns: Column[];
}
