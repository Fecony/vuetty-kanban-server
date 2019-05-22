import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../users/dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  async login(@Res() res: any, @Body() body: LoginUserDto) {
    if (!(body && body.email && body.password)) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'Email and Password are required!' });
    }

    return await this.authService.validateUserByPassword(body);
  }
}
