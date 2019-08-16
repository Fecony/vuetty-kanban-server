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
import { prepareMeta } from '../common/utils/prepare-meta.util';
import { getFormattedColumnName } from '../common/utils/column-name.utils';
import { isString, isNull } from 'util';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel('Project') private readonly projectModel: Model<IProject>,
  ) {}

  LIMIT: number = 25;

  async getAll(page: number = 1): Promise<object> {
    try {
      const total = await this.projectModel.countDocuments();
      const projects = await this.projectModel
        .find()
        .limit(this.LIMIT)
        .skip(this.LIMIT * (page - 1))
        .exec();

      if (!projects) {
        throw new HttpException("Can't get projects...", HttpStatus.NOT_FOUND);
      }

      let meta = prepareMeta(page, this.LIMIT, total);
      let data = { meta, data: projects };

      return data;
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

  async addColumn(ID: string, body: any): Promise<IProject> {
    let {
      column: { name, order },
    } = body;

    // Check if project exists and get last order number
    let project: any = await this.getById(ID);
    let lastOrderNum = Math.max(...project.columns.map(o => o.order), 0);

    // Values for new column
    order = order ? order : lastOrderNum + 1;
    name = name
      .split(' ')
      .join('_')
      .toUpperCase();

    let hasColumn = project.columns.some(
      (columnValue: { name: string }) => columnValue.name == name,
    );

    if (hasColumn) {
      throw new HttpException('Column Already exists', HttpStatus.BAD_REQUEST);
    }

    let result = this.projectModel
      .findByIdAndUpdate({ _id: ID }, { $push: { columns: { name, order } } })
      .then(() => {
        return { ok: true };
      })
      .catch(err => {
        throw new HttpException(
          'Something happened when adding new column...' + err,
          HttpStatus.BAD_REQUEST,
        );
      });

    return result;
  }

  async updateColumn(ID: string, column: string, body: any): Promise<any> {
    let {
      column: { name, order },
    } = body;

    let project: any = await this.getById(ID);

    column = getFormattedColumnName(column); // Old Value
    name = getFormattedColumnName(name); // New Value

    let canBeUpdated = project.columns.some(
      (columnValue: { name: string }) => columnValue.name == column,
    );

    let isAlreadyDefined = project.columns.some(
      (columnValue: { name: string }) => columnValue.name == name,
    );

    if (!canBeUpdated) {
      throw new HttpException(
        `Column ${column} doesn't exist!`,
        HttpStatus.BAD_REQUEST,
      );
    } else if (isAlreadyDefined) {
      throw new HttpException(
        `New Column name ${name} already exists in project!`,
        HttpStatus.BAD_REQUEST,
      );
    } else {
      let currentOrder = project.columns.filter(o => o.name == column);
      order = order ? order : currentOrder[0]['order'];

      let result = this.projectModel
        .updateOne(
          { _id: ID, 'columns.name': column },
          { $set: { 'columns.$.name': name, 'columns.$.order': order } },
        )
        .then(() => {
          return { ok: true };
        })
        .catch(err => {
          throw new HttpException(
            'Something happened when updating column...' + err,
            HttpStatus.BAD_REQUEST,
          );
        });

      return result;
    }
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
}
