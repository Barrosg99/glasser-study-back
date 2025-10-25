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

  @ResolveField(() => Post, { description: 'Get the post for a comment' })
  async post(@Parent() comment: Comment) {
    return this.commentService.getPost(comment.post);
  }

  @ResolveField(() => User, { description: 'Get the author for a comment' })
  author(@Parent() comment: Comment) {
    return { _typename: 'User', id: comment.author };
  }

  @ResolveField(() => Boolean, {
    description: 'Check if the current user is the author of the comment',
  })
  isAuthor(
    @Parent() comment: Comment,
    @Context('userId') userId: Types.ObjectId,
  ) {
    return comment.author.equals(userId);
  }

  @Mutation(() => Comment, {
    description:
      'Create a comment, Ex: createComment(input: { postId: "1234567890", content: "Comment content" })',
  })
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

  @Query(() => [Comment], {
    description:
      'Get all comments for a post, Ex: getComments(postId: "1234567890")',
  })
  async getComments(@Args('postId', { type: () => String }) postId: string) {
    return this.commentService.getComments(new Types.ObjectId(postId));
  }

  @Mutation(() => Boolean, {
    description: 'Delete a comment, Ex: deleteComment(commentId: "1234567890")',
  })
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
