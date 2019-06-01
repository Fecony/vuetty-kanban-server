import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ITicket } from './interfaces/ticket.interface';
import { CreateTicketDTO } from './dto/create-ticket.dto';
import { IUser } from '../users/interfaces/user.interface';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel('Ticket') private readonly ticketsModel: Model<ITicket>,
    @InjectModel('User') private readonly usersModel: Model<IUser>,
  ) {}

  async getAll(): Promise<ITicket[]> {
    const tickets = await this.ticketsModel
      .find()
      .populate('author assignee project')
      .exec();
    return tickets;
  }

  async getById(ID: string): Promise<ITicket> {
    const ticket = await this.ticketsModel
      .findById(ID)
      .populate('author assignee project')
      .exec();
    return ticket;
  }

  async create(createTicketDTO: CreateTicketDTO): Promise<ITicket> {
    const newTicket = await this.ticketsModel(createTicketDTO);
    const { assignee } = createTicketDTO;
    try {
      // Search for assigned user if exists push ticket to tickets[]
      if (assignee) {
        await this.usersModel.findById(assignee).then(user => {
          if (!user) return new Error("User doesn't exists.");
          user.tickets.push(newTicket._id);
          user.save(err => {
            if (err) throw new Error(err);
          });
        });
      }
    } catch (error) {
      console.error('ERROR: ', error);
      return error;
    }

    return newTicket
      .save()
      .then(ticket =>
        ticket.populate('author assignee project').execPopulate(),
      );
  }

  async update(ID: string, createTicketDTO: CreateTicketDTO): Promise<ITicket> {
    const updatedTicket = await this.ticketsModel
      .findByIdAndUpdate(ID, createTicketDTO, { new: true })
      .populate('assignee author');
    return updatedTicket;
  }

  async delete(ID: string): Promise<ITicket> {
    return await this.ticketsModel.findByIdAndRemove(ID);
  }
}
