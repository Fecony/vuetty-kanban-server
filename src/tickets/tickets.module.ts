import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsResolver } from './tickets.resolver';
import { TicketsService } from './tickets.service';
import { TicketSchema } from './schemas/ticket.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Ticket', schema: TicketSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    UsersModule,
  ],
  controllers: [TicketsController],
  providers: [TicketsResolver, TicketsService],
})
export class TicketsModule {}
