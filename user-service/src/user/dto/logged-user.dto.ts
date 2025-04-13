import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class LoggedUserDto {
  @Field()
  readonly email: string;

  @Field()
  password: string;
}

@ObjectType()
export class LoggedUserResponse {
  @Field()
  token: string;
}
