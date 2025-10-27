import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Input data for saving a task' })
export class SaveTaskDto {
  @Field()
  readonly name: string;

  @Field({ nullable: true })
  readonly link: string;

  @Field(() => Boolean)
  readonly completed: boolean;
}

@InputType({ description: 'Input data for saving a goal' })
export class SaveGoalDto {
  @Field()
  readonly name: string;

  @Field({ nullable: true })
  readonly description?: string;

  @Field(() => [SaveTaskDto], { nullable: 'items' })
  readonly tasks?: SaveTaskDto[];
}
