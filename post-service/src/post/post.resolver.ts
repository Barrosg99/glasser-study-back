import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Context,
  Parent,
  ResolveField,
} from '@nestjs/graphql';
import { PostService } from './post.service';
import { Post, User } from './models/post.model';
import { SavePostDto } from './dto/save-post.dto';
import { Types } from 'mongoose';

@Resolver(() => Post)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @ResolveField(() => User)
  async author(@Parent() post: Post) {
    return { _typename: 'User', id: post.author };
  }

  @Mutation(() => Post)
  createPost(
    @Context('userId') userId: Types.ObjectId,
    @Args('createPostInput') savePostInput: SavePostDto,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.postService.create(savePostInput, userId);
  }

  @Query(() => [Post], { name: 'posts' })
  findAll() {
    return this.postService.findAll();
  }

  @Query(() => Post, { name: 'post' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.postService.findOne(id);
  }

  @Query(() => [Post], { name: 'myPosts' })
  findMyPosts(@Context('userId') userId: Types.ObjectId) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.postService.findAll(userId);
  }

  @Mutation(() => Post)
  updatePost(
    @Context('userId') userId: Types.ObjectId,
    @Args('id') id: string,
    @Args('updatePostInput') updatePostInput: SavePostDto,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.postService.update(id, userId, updatePostInput);
  }

  @Mutation(() => Post)
  removePost(
    @Context('userId') userId: Types.ObjectId,
    @Args('id', { type: () => ID }) id: string,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.postService.remove(id, userId);
  }
}
