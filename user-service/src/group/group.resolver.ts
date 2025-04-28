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

@Resolver((of) => Group)
export class GroupResolver {
  constructor(
    private readonly groupService: GroupService,
    private readonly userService: UserService,
  ) {}

  @ResolveField(() => [User])
  async members(@Parent() group: Group) {
    return this.userService.findByIds(group.members);
  }

  @ResolveField(() => [User])
  async moderator(@Parent() group: Group) {
    return this.userService.findOne(group.moderator);
  }

  @Mutation((returns) => Group)
  createGroup(
    @Context('userId') userId: string,
    @Args('createGroupData') createGroupDto: CreateGroupDto,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.groupService.create(createGroupDto, userId);
  }

  @Query((returns) => [Group])
  myGroups(@Context('userId') userId: string) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.groupService.findAll(userId);
  }

  // @Query('group')
  // findOne(@Args('id', { type: () => ID }) id: string) {
  //   return this.groupService.findOne(id);
  // }

  // @Mutation('updateGroup')
  // update(
  //   @Args('id', { type: () => ID }) id: string,
  //   @Args('updateGroupData') updateGroupDto: CreateGroupDto,
  // ) {
  //   return this.groupService.update(id, updateGroupDto);
  // }

  // @Mutation('removeGroup')
  // remove(@Args('id', { type: () => ID }) id: string) {
  //   return this.groupService.remove(id);
  // }
}
