import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IProject } from './interfaces/project.interface';
import { CreateProjectDTO } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel('Project') private readonly projectModel: Model<IProject>,
  ) {}

  async getAll(page: number = 1): Promise<IProject[]> {
    try {
      const projects = await this.projectModel
        .find()
        .limit(25)
        .skip(25 * (page - 1))
        .exec();

      if (!projects) {
        throw new HttpException("Can't get projects...", HttpStatus.NOT_FOUND);
      }
      return projects;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getById(ID: string): Promise<IProject> {
    try {
      const project = await this.projectModel.findById(ID).exec();

      if (!project) {
        throw new NotFoundException(`Project with id: ${ID} does not exist!`);
      }
      return project;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async create(createProjectDTO: CreateProjectDTO): Promise<IProject> {
    try {
      const newProject = await this.projectModel(createProjectDTO).save();
      return newProject;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
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
              throw new HttpException(
                'Something happened',
                HttpStatus.BAD_REQUEST,
              );
            });
          return result;
        } else {
          throw new HttpException(
            'Column Already exists',
            HttpStatus.BAD_REQUEST,
          );
        }
      })
      .catch(() => {
        throw new HttpException('Something Happened', HttpStatus.BAD_REQUEST);
      });
    return result;
  }

  async deleteColumn(ID: string, body: any): Promise<object> {
    const str = body.column
      .split(' ')
      .join('_')
      .toUpperCase();
    let result = await this.projectModel
      .findOne({ _id: ID })
      .find({ columns: str }) // Check if project with ID exists, then check if column with that value exists
      .then(doc => {
        if (doc.length <= 0) {
          throw new HttpException(
            `Project with column: ${str} doesn't exist`,
            HttpStatus.BAD_REQUEST,
          );
        }
        // Remove column from array
        let result = doc[0]
          .updateOne({ $pull: { columns: str } })
          .then(() => {
            return { ok: true };
          })
          .catch(() => {
            throw new HttpException(
              "Can't update column.",
              HttpStatus.BAD_REQUEST,
            );
          });
        return result;
      })
      .catch(() => {
        throw new HttpException(
          'Something bad happened.',
          HttpStatus.BAD_REQUEST,
        );
      });
    return result;
  }

  async update(
    ID: string,
    createProjectDTO: CreateProjectDTO,
  ): Promise<IProject> {
    try {
      const updatedProject = await this.projectModel.findByIdAndUpdate(
        ID,
        createProjectDTO,
        { new: true },
      );
      return updatedProject;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async delete(ID: string) {
    try {
      const deletedProject = await this.projectModel.findByIdAndRemove(ID);
      if (!deletedProject) {
        throw new HttpException(
          `Project with ID: ${ID} doesn't exist`,
          HttpStatus.BAD_REQUEST,
        );
      }
      return { msg: 'OK' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
