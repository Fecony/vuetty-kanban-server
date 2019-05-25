import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @Post('/login')
  async login(@Body() body: LoginUserDto) {
    if (!(body && body.email && body.password)) {
      return { error: 'Email and Password are required!' };
    }

    return await this.authService.validateUserByPassword(body);
  }
  BadRequestException;
  @Post('/register')
  async register(@Body() body: LoginUserDto) {
    if (!(body && body.email && body.password)) {
      return { error: 'Email and Password are required!' };
    }

    let user = await this.userService.findOneByEmail(body.email);

    if (user) {
      return { error: 'User with this email already exists.' };
    } else {
      user = await this.userService.register(body);
      if (user) {
        user.password = undefined;
      }
      return { msg: 'User successfully registered!', user };
    }
  }
}
