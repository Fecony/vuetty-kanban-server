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

  async addColumn(ID: string, body: string): Promise<object> {
    const str = body
      .split(' ')
      .join('_')
      .toUpperCase();
    let result = this.projectModel
      .findOne({ _id: ID }) // Search if projects exists
      .find({ columns: str }) // Search if column is there already
      .then(doc => {
        // If column is not here
        if (doc.length <= 0) {
          let result = this.projectModel
            .updateOne(
              { _id: ID },
              { $push: { columns: str } }, // Push new column to [columns]
            )
            .then(() => {
              return { ok: true };
            })
            .catch(() => {
              return { ok: false, error: 'Something happened' };
            });
          return result;
        } else {
          return { ok: false, error: 'Column Already exists' };
        }
      })
      .catch(() => {
        return { ok: false, error: 'Something happened' };
      });
    return result;
  }

  async deleteColumn(ID: string, body: string): Promise<object> {
    let result = await this.projectModel
      .findOne({ _id: ID })
      .find({ columns: body }) // Check if project with ID exists, then check if column with that value exists
      .then(doc => {
        if (doc.length <= 0) {
          return {
            ok: false,
            error: `Project with column: ${body} doesn't exist`,
          };
        }
        // Remove column from array
        let result = doc[0]
          .updateOne({ $pull: { columns: body } })
          .then(() => {
            return { ok: true };
          })
          .catch(() => {
            return { ok: false, error: "Can't update column ." };
          });
        return result;
      })
      .catch(() => {
        return { ok: false, error: 'Something bad happened.' };
      });
    return result;
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
