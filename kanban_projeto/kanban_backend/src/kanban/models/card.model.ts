import { Field, ID, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class Card {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  createdAt: Date;

  @Field()
  columnId: string;

  @Field(() => Int)
  position: number;

  @Field({ nullable: true })
  color?: string;
}
