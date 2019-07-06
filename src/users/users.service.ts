import { Model } from 'mongoose';
import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private userModel: Model<IUser>) {}

  async getAll(page: number = 1): Promise<IUser[]> {
    try {
      const users = await this.userModel
        .find()
        .limit(25)
        .skip(25 * (page - 1))
        .populate('tickets')
        .select(['-password'])
        .exec();
      if (!users) {
        throw new HttpException("Can't get users...", HttpStatus.NOT_FOUND);
      }
      return users;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
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
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findOneByEmail(email: string): Model<IUser> {
    let user = this.userModel.findOne({ email: email });
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<IUser> {
    if (!(createUserDto && createUserDto.email && createUserDto.password)) {
      throw new HttpException(
        'Email and Password are requred!',
        HttpStatus.BAD_REQUEST,
      );
    }
    let user = await this.findOneByEmail(createUserDto.email);

    if (user) {
      throw new HttpException(
        `User with email: ${createUserDto.email} already exists`,
        HttpStatus.BAD_REQUEST,
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
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
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
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async delete(ID: string): Promise<any> {
    try {
      const deletedUser = await this.userModel.findByIdAndRemove(ID);
      if (!deletedUser) {
        throw new HttpException(
          `User with ID: ${ID} doesn't exist`,
          HttpStatus.BAD_REQUEST,
        );
      }
      return { msg: 'OK' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async setAvatar(ID: string, avatar: any) {
    if (!avatar) {
      throw new HttpException('Avatar is missing!', HttpStatus.BAD_REQUEST);
    }
    try {
      await this.userModel.findByIdAndUpdate(ID, {
        profilePicture: avatar.filename,
      });
      return { msg: 'OK' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
