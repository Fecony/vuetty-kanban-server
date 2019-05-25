import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Res,
  HttpStatus,
  Param,
  NotFoundException,
  Put,
  Query,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  async getAll() {
    return await this.userService.getAll();
  }

  @Get(':id')
  async getById(@Res() res, @Param('id') id) {
    const user = await this.userService.getById(id);
    if (!user) throw new NotFoundException('User does not exist!');
    return res.status(HttpStatus.OK).json(user);
  }

  @Post()
  @UseGuards(AuthGuard())
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

  @Put('update')
  @UseGuards(AuthGuard())
  async update(
    @Res() res,
    @Query('id') id,
    @Body() createUserDTO: CreateUserDto,
  ) {
    const user = await this.userService.update(id, createUserDTO);
    if (!user) throw new NotFoundException('User does not exist!');
    return res.status(HttpStatus.OK).json(user);
  }

  @Delete('delete')
  @UseGuards(AuthGuard())
  async delete(@Res() res, @Query('id') id) {
    const user = await this.userService.delete(id);
    if (!user) throw new NotFoundException('User does not exist!');
    return res.status(HttpStatus.OK).json(user);
  }
}
