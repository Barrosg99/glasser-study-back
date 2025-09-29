import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SaveTaskDto {
  @Field()
  readonly name: string;

  @Field({ nullable: true })
  readonly link: string;

  @Field(() => Boolean)
  readonly completed: boolean;
}

@InputType()
export class SaveGoalDto {
  @Field()
  readonly name: string;

  @Field({ nullable: true })
  readonly description?: string;

  @Field(() => [SaveTaskDto], { nullable: 'items' })
  readonly tasks?: SaveTaskDto[];
}
