import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AdminEditUserDto {
  @Field(() => Boolean)
  readonly isAdmin: boolean;

  @Field(() => Boolean)
  readonly blocked: boolean;
}
