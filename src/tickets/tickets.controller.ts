import {
  Controller,
  Get,
  Res,
  HttpStatus,
  Param,
  NotFoundException,
  Post,
  Body,
  Put,
  Query,
  Delete,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDTO } from './dto/create-ticket.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Get()
  async getAll(@Res() res) {
    const tickets = await this.ticketsService.getAll();
    return res.status(HttpStatus.OK).json(tickets);
  }

  @Get(':id')
  async getById(@Res() res, @Param('id') id) {
    const ticket = await this.ticketsService.getById(id);
    if (!ticket) throw new NotFoundException('Ticket does not exist!');
    return res.status(HttpStatus.OK).json(ticket);
  }

  @Post()
  async create(@Res() res, @Body() createTicketDTO: CreateTicketDTO) {
    const ticket = await this.ticketsService.create(createTicketDTO);
    return res.status(HttpStatus.OK).json(ticket);
  }

  @Put('update')
  async update(
    @Res() res,
    @Query('id') id,
    @Body() createTicketDTO: CreateTicketDTO,
  ) {
    const ticket = await this.ticketsService.update(id, createTicketDTO);
    if (!ticket) throw new NotFoundException('Ticket does not exist!');
    return res.status(HttpStatus.OK).json(ticket);
  }

  @Delete('/delete')
  async deleteTicket(@Res() res, @Query('id') id) {
    const ticket = await this.ticketsService.delete(id);
    if (!ticket) throw new NotFoundException('Ticket does not exist');
    return res.status(HttpStatus.OK).json(ticket);
  }
}
