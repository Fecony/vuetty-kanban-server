import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/graphql-auth.guard';

@Resolver('Users')
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query('users')
  async getUsers() {
    return await this.usersService.getAll();
  }

  @Query('user')
  async getUser(@Args('id') id: string) {
    return await this.usersService.getById(id);
  }

  @Mutation('createUser')
  @UseGuards(GqlAuthGuard)
  async create(@Args('user') args: CreateUserDto) {
    return await this.usersService.create(args);
  }

  @Mutation('updateUser')
  @UseGuards(GqlAuthGuard)
  async update(@Args('id') id: string, @Args('user') args: CreateUserDto) {
    return await this.usersService.update(id, args);
  }

  @Mutation('deleteUser')
  @UseGuards(GqlAuthGuard)
  async delete(@Args('id') id: string) {
    return await this.usersService.delete(id);
  }
}
