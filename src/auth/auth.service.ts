import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUserByPassword(loginAttempt: LoginUserDto) {
    let userToAttempt = await this.usersService.findOneByEmail(
      loginAttempt.email,
    );

    return new Promise((resolve, reject) => {
      userToAttempt.checkPassword(
        loginAttempt.password,
        (err: Error, isMatch: boolean) => {
          if (err)
            reject(new HttpException('Error occured', HttpStatus.FORBIDDEN));

          if (isMatch) {
            resolve(this.createToken(userToAttempt));
          } else {
            reject(
              new HttpException("Password doesn't match", HttpStatus.FORBIDDEN),
            );
          }
        },
      );
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

  createToken(user: LoginUserDto) {
    let data: JwtPayload = {
      email: user.email,
    };

    let token = this.jwtService.sign(data);

    return {
      expiresIn: 3600,
      token,
    };
  }
}
