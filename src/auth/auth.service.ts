import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUserByPassword(loginAttempt: LoginUserDto) {
    if (!(loginAttempt && loginAttempt.email && loginAttempt.password)) {
      throw new HttpException(
        'Email and Password are required!',
        HttpStatus.FORBIDDEN,
      );
    }

    let userToAttempt = await this.usersService.findOneByEmail(
      loginAttempt.email,
    );

    if (!userToAttempt) {
      throw new HttpException("User dosn't exist", HttpStatus.BAD_REQUEST);
    }

    return new Promise((resolve, reject) => {
      if (userToAttempt) {
        userToAttempt.checkPassword(
          loginAttempt.password,
          (err: Error, isMatch: boolean) => {
            if (err)
              reject(new HttpException('Error occured', HttpStatus.FORBIDDEN));

            if (isMatch) {
              resolve(this.createToken(userToAttempt));
            } else {
              reject(
                new HttpException(
                  "Password doesn't match",
                  HttpStatus.FORBIDDEN,
                ),
              );
            }
          },
        );
      } else {
        reject(new NotFoundException("Users doesn't exist!"));
      }
    });
  }

  async validateUserByJwt(payload: JwtPayload) {
    let user = await this.usersService.findOneByEmail(payload.email);

    if (user) {
      return this.createToken(user);
    } else {
      return new UnauthorizedException();
    }
  }

  async register(body: CreateUserDto) {
    return await this.usersService.create(body);
  }

  createToken(userData: CreateUserDto) {
    let data: JwtPayload = {
      email: userData.email,
    };

    var user = (({
      id,
      email,
      username,
      firstname,
      lastname,
      role,
      profilePicture,
    }) => ({ id, email, username, firstname, lastname, role, profilePicture }))(
      userData,
    );

    let token = this.jwtService.sign(data);

    return {
      user,
      expiresIn: 3600,
      token,
    };
  }
}
