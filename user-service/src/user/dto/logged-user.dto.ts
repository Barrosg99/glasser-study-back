import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType({ description: 'Input data for logging in a user' })
export class LoggedUserDto {
  @Field()
  readonly email: string;

  @Field()
  password: string;
}

@ObjectType({ description: 'Response for logging in a user' })
export class LoggedUserResponse {
  @Field()
  token: string;
}
