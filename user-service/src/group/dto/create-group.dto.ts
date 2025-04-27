import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateGroupDto {
  @Field()
  readonly name: string;

  @Field()
  readonly description: string;

  @Field(() => [String], { nullable: true })
  readonly memberEmails?: string[];
}
