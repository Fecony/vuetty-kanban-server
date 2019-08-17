import { Model } from 'mongoose';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { prepareMeta } from '../common/utils/prepare-meta.util';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private userModel: Model<IUser>) {}

  LIMIT: number = 25;

  async getAll(page: number = 1): Promise<object> {
    try {
      const total = await this.userModel.countDocuments();
      const users = await this.userModel
        .find()
        .limit(this.LIMIT)
        .skip(this.LIMIT * (page - 1))
        .populate('tickets')
        .select(['-password'])
        .exec();

      if (!users) {
        throw new NotFoundException("Can't get users...");
      }

      let meta = prepareMeta(page, this.LIMIT, total);
      let data = { meta, data: users };

      return data;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getById(ID: string): Promise<IUser> {
    try {
      const user = await this.userModel
        .findById(ID)
        .populate('tickets')
        .select(['-password'])
        .exec();
      if (!user) {
        throw new NotFoundException(`User with id: ${ID} does not exist!`);
      }
      return user;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOneByEmail(email: string): Model<IUser> {
    return await this.userModel.findOne({ email: email });
  }

  async create(createUserDto: CreateUserDto): Promise<IUser> {
    if (!(createUserDto && createUserDto.email && createUserDto.password)) {
      throw new BadRequestException('Email and Password are requred!');
    }
    let user = await this.findOneByEmail(createUserDto.email);

    if (user) {
      throw new BadRequestException(
        `User with email: ${createUserDto.email} already exists`,
      );
    }

    try {
      const newUser = await this.userModel(createUserDto)
        .populate('tickets')
        .save();
      if (newUser) {
        newUser.password = undefined;
      }
      return newUser;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(ID: string, createUserDto: IUser): Promise<IUser> {
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(ID, createUserDto, { new: true })
        .populate('tickets')
        .select(['-password']);
      return updatedUser;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(ID: string): Promise<any> {
    try {
      const deletedUser = await this.userModel.findByIdAndRemove(ID);
      if (!deletedUser) {
        throw new BadRequestException(`User with ID: ${ID} doesn't exist`);
      }
      return { ok: true };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async setAvatar(ID: string, avatar: any) {
    if (!avatar) {
      throw new BadRequestException('Avatar is missing!');
    }
    try {
      await this.userModel.findByIdAndUpdate(ID, {
        profilePicture: avatar.filename,
      });
      return { ok: true };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
