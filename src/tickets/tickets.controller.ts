import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Query,
  Delete,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDTO } from './dto/create-ticket.dto';
import { IdValidation } from '../common/pipes/IdValidation.pipe';
import { AuthGuard } from '@nestjs/passport';
import { PageValidation } from '../common/pipes/PageValidation.pipe';

@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Get()
  @UsePipes(new PageValidation())
  async getAll(@Query('page') page: number) {
    return await this.ticketsService.getAll(page);
  }

  @Get(':id')
  @UsePipes(new IdValidation())
  async getById(@Param('id') id) {
    return await this.ticketsService.getById(id);
  }

  @Post()
  @UseGuards(AuthGuard())
  async create(@Body() body: CreateTicketDTO) {
    return await this.ticketsService.create(body);
  }

  @Put()
  @UseGuards(AuthGuard())
  @UsePipes(new IdValidation())
  async update(@Query('id') id, @Body() body: CreateTicketDTO) {
    return await this.ticketsService.update(id, body);
  }

  @Delete()
  @UseGuards(AuthGuard())
  @UsePipes(new IdValidation())
  async deleteTicket(@Query('id') id) {
    return await this.ticketsService.delete(id);
  }
}
