import {
  Controller,
  Post,
  Res,
  Body,
  HttpStatus,
  Get,
  Param,
  NotFoundException,
  Put,
  Query,
  Delete,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDTO } from './dto/create-project.dto';
import { AuthGuard } from '@nestjs/passport';
import { IdValidation } from '../common/pipes/IdValidation.pipe';

@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
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

  @Put('update')
  @UsePipes(new IdValidation())
  @UseGuards(AuthGuard())
  async update(@Query('id') id, @Body() body: CreateProjectDTO) {
    return await this.projectsService.update(id, body);
  }

  @Put('column')
  @UseGuards(AuthGuard())
  @UsePipes(new IdValidation())
  async addColumn(@Query('id') id, @Body() body) {
    return await this.projectsService.addColumn(id, body.column);
  }

  @Delete('delete')
  @UseGuards(AuthGuard())
  @UsePipes(new IdValidation())
  async delete(@Query('id') id) {
    return await this.projectsService.delete(id);
  }

  @Delete('column')
  @UseGuards(AuthGuard())
  @UsePipes(new IdValidation())
  async deleteColumn(@Query('id') id, @Body() body) {
    return await this.projectsService.deleteColumn(id, body);
  }
}
