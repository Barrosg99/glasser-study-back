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
import { CreatePostDto } from './dto/create-post.dto';
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
    @Args('createPostInput') createPostInput: CreatePostDto,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.postService.create(createPostInput, userId);
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
    return this.postService.findAll(userId);
  }

  // @Mutation(() => Post)
  // updatePost(@Args('updatePostInput') updatePostInput: UpdatePostInput) {
  //   return this.postService.update(updatePostInput.id, updatePostInput);
  // }

  // @Mutation(() => Post)
  // removePost(@Args('id', { type: () => ID }) id: string) {
  //   return this.postService.remove(id);
  // }
}
