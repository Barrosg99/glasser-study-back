import { Field, InputType } from '@nestjs/graphql';
import { UserGoal } from '../models/user.model';

@InputType()
export class CreateUserDto {
  @Field()
  readonly name: string;

  @Field({ nullable: true })
  readonly email?: string;

  @Field({ nullable: true })
  password?: string;

  @Field(() => UserGoal)
  readonly goal: UserGoal;
}
