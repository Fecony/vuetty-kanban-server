import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ITicket } from './interfaces/ticket.interface';
import { CreateTicketDTO } from './dto/create-ticket.dto';
import { IUser } from '../users/interfaces/user.interface';
import { ObjectID } from 'mongodb';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel('Ticket') private readonly ticketsModel: Model<ITicket>,
    @InjectModel('User') private readonly usersModel: Model<IUser>,
  ) {}

  async getAll(page: number = 1): Promise<ITicket[]> {
    try {
      const tickets = await this.ticketsModel
        .find()
        .limit(25)
        .skip(25 * (page - 1))
        .populate('author assignee project')
        .exec();
      if (!tickets) {
        throw new HttpException("Can't get tickets...", HttpStatus.NOT_FOUND);
      }
      return tickets;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getById(ID: string): Promise<ITicket> {
    try {
      const ticket = await this.ticketsModel
        .findById(ID)
        .populate('author assignee project')
        .exec();
      if (!ticket)
        throw new NotFoundException(`Ticket with id: ${ID} does not exist!`);
      return ticket;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async create(createTicketDTO: CreateTicketDTO): Promise<ITicket> {
    const newTicket = await this.ticketsModel(createTicketDTO);
    const { assignee } = createTicketDTO;
    try {
      // Search for assigned user if exists push ticket to tickets[]
      if (assignee) {
        if (!ObjectID.isValid(assignee)) {
          throw new HttpException(
            `ID: '${assignee}' is not valid.`,
            HttpStatus.BAD_REQUEST,
          );
        }
        await this.usersModel.findById(assignee).then(user => {
          if (!user)
            throw new HttpException(
              "User doesn't exists.",
              HttpStatus.NOT_FOUND,
            );
          user.tickets.push(newTicket._id);
          user.save(error => {
            if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
          });
        });
      }
      let ticket = newTicket
        .save()
        .then(ticket =>
          ticket.populate('author assignee project').execPopulate(),
        );
      return ticket;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async update(ID: string, createTicketDTO: CreateTicketDTO): Promise<ITicket> {
    try {
      const updatedTicket = await this.ticketsModel
        .findByIdAndUpdate(ID, createTicketDTO, { new: true })
        .populate('assignee author');
      return updatedTicket;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async delete(ID: string): Promise<any> {
    try {
      const deletedTicket = await this.ticketsModel.findByIdAndRemove(ID);
      if (!deletedTicket)
        throw new HttpException(
          `Ticket with id: ${ID} doesn't exist`,
          HttpStatus.BAD_REQUEST,
        );
      return { msg: 'OK' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
