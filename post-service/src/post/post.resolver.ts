import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Context,
  Parent,
  ResolveField,
  Int,
} from '@nestjs/graphql';
import { PostService } from './post.service';
import { Post, User } from './models/post.model';
import { SavePostDto } from './dto/save-post.dto';
import { Types } from 'mongoose';
import { PostSummaryResponse } from './dto/post-summary.dto';
import { PostSummaryInput } from './dto/post-summary.dto';

@Resolver(() => Post)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @ResolveField(() => Boolean)
  isAuthor(@Parent() post: Post, @Context('userId') userId: Types.ObjectId) {
    return post.author.equals(userId);
  }

  @ResolveField(() => User)
  async author(@Parent() post: Post) {
    return { _typename: 'User', id: post.author };
  }

  @Mutation(() => Post)
  savePost(
    @Context('userId') userId: Types.ObjectId,
    @Args('savePostInput') savePostInput: SavePostDto,
    @Args('id', { type: () => ID, nullable: true }) id?: string,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.postService.save(id, savePostInput, userId);
  }

  @Query(() => [Post], { name: 'posts' })
  findAll(
    @Args('searchTerm', { type: () => String, nullable: true })
    searchTerm?: string,
    @Args('searchFilter', { type: () => String, nullable: true })
    searchFilter?: string,
    @Args('subject', { type: () => String, nullable: true }) subject?: string,
    @Args('materialType', { type: () => String, nullable: true })
    materialType?: string,
  ) {
    return this.postService.findAll({
      searchTerm,
      searchFilter,
      subject,
      materialType,
    });
  }

  @Query(() => Post, { name: 'post' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.postService.findOne(id);
  }

  @Query(() => [Post], { name: 'myPosts' })
  findMyPosts(@Context('userId') userId: Types.ObjectId) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.postService.findAll({ userId });
  }

  @Mutation(() => Post)
  removePost(
    @Context('userId') userId: Types.ObjectId,
    @Args('id', { type: () => ID }) id: string,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.postService.remove({ id, userId });
  }

  // only admin
  @Query(() => [Post])
  adminGetPosts(
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
  ) {
    if (from !== 'admin' || !isAdmin)
      throw new Error('You do not have permission to execute this action.');

    return this.postService.findAll({ isAdmin });
  }

  @Query(() => Int)
  adminCountPosts(
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
  ) {
    if (from !== 'admin' || !isAdmin)
      throw new Error('You do not have permission to execute this action.');

    return this.postService.countPosts();
  }

  @Query(() => Post)
  adminGetPost(
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    if (from !== 'admin' || !isAdmin)
      throw new Error('You do not have permission to execute this action.');

    return this.postService.findOne(id);
  }

  @Mutation(() => Post)
  adminDeletePost(
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    if (from !== 'admin' || !isAdmin)
      throw new Error('You do not have permission to execute this action.');

    return this.postService.remove({ id, isAdmin });
  }

  @Query((returns) => PostSummaryResponse)
  async adminGetPostSummary(
    @Args('postSummaryInput') postSummaryInput: PostSummaryInput,
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
  ) {
    if (from !== 'admin' || !isAdmin)
      throw new Error('You do not have permission to execute this action.');

    return this.postService.summary(postSummaryInput.period);
  }
}
