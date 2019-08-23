import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Query,
  Delete,
  UseGuards,
  UsePipes,
  Patch,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDTO } from './dto/create-project.dto';
import { AuthGuard } from '@nestjs/passport';
import { IdValidation } from '../common/pipes/IdValidation.pipe';
import { PageValidation } from '../common/pipes/PageValidation.pipe';
import { CreateColumnDTO } from './dto/create-column.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  @UsePipes(new PageValidation())
  async getAll(@Query('page') page: number) {
    return await this.projectsService.getAll(page);
  }

  @Get(':id')
  @UsePipes(new IdValidation())
  async getById(@Param('id') id) {
    return await this.projectsService.getById(id);
  }

  @Post()
  @UseGuards(AuthGuard())
  async create(@Body() body: CreateProjectDTO) {
    return await this.projectsService.create(body);
  }

  @Put()
  @UsePipes(new IdValidation())
  @UseGuards(AuthGuard())
  async update(@Query('id') id, @Body() body: CreateProjectDTO) {
    return await this.projectsService.update(id, body);
  }

  @Delete()
  @UseGuards(AuthGuard())
  @UsePipes(new IdValidation())
  async delete(@Query('id') id) {
    return await this.projectsService.delete(id);
  }

  // COLUMN routes
  @Put('column')
  @UseGuards(AuthGuard())
  @UsePipes(new IdValidation())
  async addColumn(@Query('id') id, @Body() body: CreateColumnDTO) {
    return await this.projectsService.addColumn(id, body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  @UsePipes(new IdValidation())
  async updateColumn(
    @Param('id') id,
    @Query('column') column,
    @Body() body: CreateColumnDTO,
  ) {
    return await this.projectsService.updateColumn(id, column, body);
  }

  @Delete('column')
  @UseGuards(AuthGuard())
  @UsePipes(new IdValidation())
  async deleteColumn(@Query('id') id, @Body() body) {
    return await this.projectsService.deleteColumn(id, body);
  }
}
