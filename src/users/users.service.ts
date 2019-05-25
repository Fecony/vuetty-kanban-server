import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private userModel: Model<IUser>) {}

  async getAll(): Promise<IUser[]> {
    return await this.userModel
      .find()
      .select(['-password'])
      .exec();
  }

  async getById(ID: string): Promise<IUser> {
    return await this.userModel
      .findById(ID)
      .select(['-password'])
      .exec();
  }

  async findOneByEmail(email: string): Model<IUser> {
    return await this.userModel.findOne({ email: email });
  }

  async create(createUserDto: CreateUserDto) {
    let newUser = new this.userModel(createUserDto);
    return await newUser.save();
  }

  async register(loginUserDTO: LoginUserDto) {
    let newUser = new this.userModel(loginUserDTO);
    return await newUser.save();
  }

  async update(ID: string, createUserDto: IUser): Promise<IUser> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      ID,
      createUserDto,
      { new: true },
    );
    return updatedUser;
  }

  async delete(ID: string): Promise<object> {
    try {
      await this.userModel.findByIdAndRemove(ID).exec();
      return { deleted: true, msg: 'The user has been deleted' };
    } catch (err) {
      return { error: 'The user could not be deleted' };
    }
  }
}