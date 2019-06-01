import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { TicketsService } from './tickets.service';
import { CreateTicketDTO } from './dto/create-ticket.dto';

@Resolver('Tickets')
export class TicketsResolver {
  constructor(private readonly ticketsService: TicketsService) {}

  @Query('tickets')
  async getTickets() {
    return await this.ticketsService.getAll();
  }

  @Query('ticket')
  async getTicket(@Args('id') id: string) {
    await this.ticketsService.getById(id);
  }

  @Mutation('createTicket')
  async create(@Args('ticket') args: CreateTicketDTO) {
    return await this.ticketsService.create(args);
  }

  @Mutation('updateTicket')
  async update(@Args('id') id: string, @Args('ticket') args: CreateTicketDTO) {
    return await this.ticketsService.update(id, args);
  }

  @Mutation('deleteTicket')
  async delete(@Args('id') id: string) {
    return await this.ticketsService.delete(id);
  }
}
