import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Comment } from './models/comment.model';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Types } from 'mongoose';
import { User, Post } from '../post/models/post.model';

@Resolver(() => Comment)
export class CommentResolver {
  constructor(private commentService: CommentService) {}

  @ResolveField(() => Post)
  async post(@Parent() comment: Comment) {
    return this.commentService.getPost(comment.post);
  }

  @ResolveField(() => User)
  author(@Parent() comment: Comment) {
    return { _typename: 'User', id: comment.author };
  }

  @ResolveField(() => Boolean)
  isAuthor(
    @Parent() comment: Comment,
    @Context('userId') userId: Types.ObjectId,
  ) {
    return comment.author.equals(userId);
  }

  @Mutation(() => Comment)
  async createComment(
    @Context('userId') userId: Types.ObjectId,
    @Args('input') input: CreateCommentDto,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.commentService.createComment(
      userId,
      new Types.ObjectId(input.postId),
      input.content,
    );
  }

  @Query(() => [Comment])
  async getComments(@Args('postId', { type: () => String }) postId: string) {
    return this.commentService.getComments(new Types.ObjectId(postId));
  }

  @Mutation(() => Boolean)
  async deleteComment(
    @Context('userId') userId: Types.ObjectId,
    @Args('commentId', { type: () => String }) commentId: string,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.commentService.deleteComment(
      new Types.ObjectId(commentId),
      userId,
    );
  }
}
