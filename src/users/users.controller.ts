import {
  Controller,
  Post,
  Body,
  Get,
  Res,
  Param,
  Put,
  Query,
  Delete,
  UseInterceptors,
  UploadedFile,
  UsePipes,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { IdValidation } from '../common/pipes/IdValidation.pipe';
import { PageValidation } from '../common/pipes/PageValidation.pipe';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  @UsePipes(new PageValidation())
  async getAll(@Query('page') page: number) {
    return await this.userService.getAll(page);
  }

  @Get(':id')
  @UsePipes(new IdValidation())
  async getById(@Param('id') id: string) {
    return await this.userService.getById(id);
  }

  @Post()
  @UseGuards(AuthGuard())
  async create(@Body() body: CreateUserDto) {
    return await this.userService.create(body);
  }

  @Put('update')
  @UseGuards(AuthGuard())
  @UsePipes(new IdValidation())
  async update(@Query('id') id: string, @Body() body: CreateUserDto) {
    return await this.userService.update(id, body);
  }

  @Delete('delete')
  @UseGuards(AuthGuard())
  @UsePipes(new IdValidation())
  async delete(@Query('id') id: string) {
    return await this.userService.delete(id);
  }

  @Get('avatars/:id')
  @UseGuards(AuthGuard())
  async serveAvatar(@Param('id') id: string, @Res() res): Promise<any> {
    res.sendFile(id, { root: 'public/avatars' });
  }

  @Post(':id/avatar')
  @UseGuards(AuthGuard())
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './public/avatars',
        filename: (req, file, cb) => {
          let ext = extname(file.originalname);
          let filename = file.fieldname + '-' + Date.now() + ext;
          return cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        var ext = extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
          return cb(new BadRequestException('Only images are allowed!'), null);
        }
        return cb(null, true);
      },
    }),
  )
  @UsePipes(new IdValidation())
  async uploadAvatar(@Param('id') id: string, @UploadedFile() avatar: object) {
    return await this.userService.setAvatar(id, avatar);
  }
}
