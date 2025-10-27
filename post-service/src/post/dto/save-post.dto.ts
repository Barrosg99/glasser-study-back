import { Field, InputType } from '@nestjs/graphql';
import { MaterialType } from '../models/post.model';

@InputType({ description: 'Input data for saving a post' })
export class MaterialInput {
  @Field()
  name: string;

  @Field()
  link: string;

  @Field(() => MaterialType)
  type: MaterialType;
}

@InputType({ description: 'Input data for saving a post' })
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
