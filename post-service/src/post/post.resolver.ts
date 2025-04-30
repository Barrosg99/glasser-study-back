import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { PostService } from './post.service';
import { Post } from './models/post.model';
import { CreatePostDto } from './dto/create-post.dto';

@Resolver(() => Post)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Mutation(() => Post)
  createPost(@Args('createPostInput') createPostInput: CreatePostDto) {
    return this.postService.create(createPostInput);
  }

  @Query(() => [Post], { name: 'posts' })
  findAll() {
    return this.postService.findAll();
  }

  @Query(() => Post, { name: 'post' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.postService.findOne(id);
  }

  @Query(() => [Post], { name: 'postsByAuthor' })
  findByAuthor(@Args('authorId', { type: () => String }) authorId: string) {
    return this.postService.findByAuthor(authorId);
  }

  // @Mutation(() => Post)
  // updatePost(@Args('updatePostInput') updatePostInput: UpdatePostInput) {
  //   return this.postService.update(updatePostInput.id, updatePostInput);
  // }

  @Mutation(() => Post)
  removePost(@Args('id', { type: () => ID }) id: string) {
    return this.postService.remove(id);
  }
}
