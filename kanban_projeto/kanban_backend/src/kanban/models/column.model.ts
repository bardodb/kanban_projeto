import { Field, ID, ObjectType, Int } from '@nestjs/graphql';
import { Card } from './card.model';

@ObjectType()
export class Column {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => Int)
  position: number;

  @Field(() => [Card], { nullable: true })
  cards?: Card[];
}
