import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class MaterialInput {
  @Field()
  name: string;

  @Field()
  link: string;

  @Field()
  type: string;
}

@InputType()
export class SavePostDto {
  @Field()
  readonly title: string;

  @Field()
  readonly subject: string;
  @Field()
  readonly description: string;

  @Field(() => [String], { nullable: true })
  readonly tags?: string[];

  @Field(() => [MaterialInput], { nullable: 'itemsAndList' })
  readonly materials?: MaterialInput[];
}
