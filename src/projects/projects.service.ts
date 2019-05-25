import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IProject } from './interfaces/project.interface';
import { CreateProjectDTO } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel('Project') private readonly projectModel: Model<IProject>,
  ) {}

  async getAll(): Promise<IProject[]> {
    const projects = await this.projectModel.find().exec();
    return projects;
  }

  async getById(ID: string): Promise<IProject> {
    const project = await this.projectModel.findById(ID).exec();
    return project;
  }

  async create(createProjectDTO: CreateProjectDTO): Promise<IProject> {
    const newProject = await this.projectModel(createProjectDTO);
    return newProject.save();
  }

  async update(
    ID: string,
    createProjectDTO: CreateProjectDTO,
  ): Promise<IProject> {
    const updatedProject = await this.projectModel.findByIdAndUpdate(
      ID,
      createProjectDTO,
      { new: true },
    );
    return updatedProject;
  }

  async delete(ID: string) {
    const deletedProject = await this.projectModel.findByIdAndRemove(ID);
    return deletedProject;
  }
}
