import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { Group } from './models/group.model';
import { User } from 'src/user/models/user.model';
import { UserService } from 'src/user/user.service';
import { Types } from 'mongoose';

@Resolver((of) => Group)
export class GroupResolver {
  constructor(
    private readonly groupService: GroupService,
    private readonly userService: UserService,
  ) {}

  @ResolveField(() => [User])
  members(@Parent() group: Group) {
    return this.userService.findByIds(group.members);
  }

  @ResolveField(() => User)
  moderator(@Parent() group: Group) {
    return this.userService.findOne(group.moderator);
  }

  @ResolveField(() => Boolean)
  isModerator(
    @Parent() group: Group,
    @Context('userId') userId: Types.ObjectId,
  ) {
    return group.moderator.equals(userId);
  }

  @Mutation((returns) => Group)
  createGroup(
    @Context('userId') userId: Types.ObjectId,
    @Args('createGroupData') createGroupDto: CreateGroupDto,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.groupService.create(createGroupDto, userId);
  }

  @Query((returns) => [Group])
  myGroups(@Context('userId') userId: Types.ObjectId) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.groupService.findAll(userId);
  }

  @Mutation((returns) => Group)
  updateGroup(
    @Context('userId') userId: Types.ObjectId,
    @Args('id', { type: () => String }) id: string,
    @Args('updateGroupData') updateGroupDto: CreateGroupDto,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.groupService.update(id, updateGroupDto);
  }

  // @Query('group')
  // findOne(@Args('id', { type: () => ID }) id: string) {
  //   return this.groupService.findOne(id);
  // }

  // @Mutation('removeGroup')
  // remove(@Args('id', { type: () => ID }) id: string) {
  //   return this.groupService.remove(id);
  // }
}
