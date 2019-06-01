import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { ProjectsService } from './projects.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/graphql-auth.guard';
import { CreateProjectDTO } from './dto/create-project.dto';

@Resolver('Projects')
export class ProjectsResolver {
  constructor(private readonly projectsService: ProjectsService) {}

  @Query('projects')
  async getProjects() {
    return await this.projectsService.getAll();
  }

  @Query('project')
  async getProject(@Args('id') id: string) {
    return await this.projectsService.getById(id);
  }

  @Mutation('createProject')
  @UseGuards(GqlAuthGuard)
  async create(@Args('project') args: CreateProjectDTO) {
    return await this.projectsService.create(args);
  }

  @Mutation('updateProject')
  @UseGuards(GqlAuthGuard)
  async update(
    @Args('id') id: string,
    @Args('project') args: CreateProjectDTO,
  ) {
    return await this.projectsService.update(id, args);
  }

  @Mutation('deleteProject')
  @UseGuards(GqlAuthGuard)
  async delete(@Args('id') id: string) {
    return await this.projectsService.delete(id);
  }

  @Mutation('addColumn')
  @UseGuards(GqlAuthGuard)
  async addColumn(@Args('id') id: string, @Args('column') column: string) {
    return await this.projectsService.addColumn(id, column);
  }

  @Mutation('deleteColumn')
  @UseGuards(GqlAuthGuard)
  async deleteColumn(@Args('id') id: string, @Args('column') column: string) {
    return await this.projectsService.deleteColumn(id, column);
  }
}
