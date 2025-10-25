import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Input data for editing a user by admin' })
export class AdminEditUserDto {
  @Field(() => Boolean)
  readonly isAdmin: boolean;

  @Field(() => Boolean)
  readonly blocked: boolean;
}
