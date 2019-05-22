import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Post()
  async create(@Res() res: any, @Body() body: CreateUserDto) {
    if (!(body && body.email && body.password)) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'Email and Password are required!' });
    }

    let user = await this.userService.findOneByEmail(body.email);

    if (user) {
      return res
        .status(HttpStatus.FORBIDDEN)
        .json({ error: 'User with this email already exists' });
    } else {
      user = await this.userService.create(body);
      if (user) {
        user.password = undefined;
      }
    }
    return res.status(HttpStatus.OK).json(user);
  }

  @Get('secret')
  @UseGuards(AuthGuard())
  testAuthRoute() {
    return {
      message: '!!!!secret information!!!!',
    };
  }
}
