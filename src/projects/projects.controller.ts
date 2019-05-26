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
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDTO } from './dto/create-project.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  async getAll(@Res() res) {
    const projects = await this.projectsService.getAll();
    return res.status(HttpStatus.OK).json(projects);
  }

  @Get(':id')
  async getById(@Res() res, @Param('id') id) {
    const project = await this.projectsService.getById(id);
    if (!project) throw new NotFoundException('Project does not exist!');
    return res.status(HttpStatus.OK).json(project);
  }

  @Post()
  @UseGuards(AuthGuard())
  async create(@Res() res, @Body() createProjectDTO: CreateProjectDTO) {
    const project = await this.projectsService.create(createProjectDTO);
    return res.status(HttpStatus.OK).json(project);
  }

  @Put('update')
  @UseGuards(AuthGuard())
  async update(
    @Res() res,
    @Query('id') id,
    @Body() createProjectDTO: CreateProjectDTO,
  ) {
    const project = await this.projectsService.update(id, createProjectDTO);
    if (!project) throw new NotFoundException('Project does not exist!');
    return res.status(HttpStatus.OK).json(project);
  }

  @Put('column')
  @UseGuards(AuthGuard())
  async addColumn(@Res() res, @Query('id') id, @Body() body) {
    if (body && body.column) {
      const result = await this.projectsService.addColumn(id, body.column);
      return res.send(result);
    }
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ ok: false, error: 'Body is empty' });
  }

  @Delete('delete')
  @UseGuards(AuthGuard())
  async delete(@Res() res, @Query('id') id) {
    const project = await this.projectsService.delete(id);
    if (!project) throw new NotFoundException('Project does not exist!');
    return res.status(HttpStatus.OK).json(project);
  }

  @Delete('column')
  @UseGuards(AuthGuard())
  async deleteColumn(@Res() res, @Query('id') id, @Body() body) {
    if (body && body.column) {
      const str = body.column
        .split(' ')
        .join('_')
        .toUpperCase();
      const result = await this.projectsService.deleteColumn(id, str);
      return res.send(result);
    }
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ ok: false, error: 'Body is empty' });
  }
}
