import { Field, InputType } from '@nestjs/graphql';
import { UserGoal } from '../models/user.model';

@InputType()
export class CreateUserDto {
  @Field()
  readonly name: string;

  @Field()
  readonly email: string;

  @Field()
  password: string;

  @Field(() => UserGoal)
  readonly goal: UserGoal;
}
