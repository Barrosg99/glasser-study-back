import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Like } from './models/like.model';
import { LikeService } from './like.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { Types } from 'mongoose';
import { User, Post } from 'src/post/models/post.model';

@Resolver(() => Like)
export class LikeResolver {
  constructor(private likeService: LikeService) {}

  @ResolveField(() => Post)
  async post(@Parent() like: Like) {
    return this.likeService.getPost(like.post);
  }

  @ResolveField(() => User)
  user(@Parent() like: Like) {
    return { _typename: 'User', id: like.user };
  }

  @Mutation(() => Like, { nullable: true })
  async toggleLike(
    @Context('userId') userId: Types.ObjectId,
    @Args('input') input: CreateLikeDto,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.likeService.toggleLike(
      userId,
      new Types.ObjectId(input.postId),
    );
  }

  @Query(() => [Like])
  async getLikes(@Args('postId', { type: () => String }) postId: string) {
    return this.likeService.getLikes(new Types.ObjectId(postId));
  }
}
