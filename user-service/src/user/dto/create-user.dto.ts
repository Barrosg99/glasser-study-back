import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { UserGoal } from '../models/user.model';

@InputType({ description: 'Input data for creating a user' })
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

@InputType({ description: 'Input data for updating a user' })
export class UpdateUserDto {
  @Field()
  readonly name: string;

  @Field({ nullable: true })
  password?: string;

  @Field(() => UserGoal)
  readonly goal: UserGoal;

  @Field(() => String, { nullable: true })
  readonly profileImageUrl?: string;
}

@ObjectType({ description: 'Response for getting a presigned URL' })
export class GetPresignedUrlResponse {
  @Field(() => String)
  readonly uploadUrl: string;

  @Field(() => String)
  readonly publicUrl: string;
}
