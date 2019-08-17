import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectID } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { ITicket } from './interfaces/ticket.interface';
import { CreateTicketDTO } from './dto/create-ticket.dto';
import { IUser } from '../users/interfaces/user.interface';
import { IProject } from '../projects/interfaces/project.interface';
import { prepareMeta } from '../common/utils/prepare-meta.util';
import { validateColumnName } from '../common/utils/validate-column.utils';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel('Ticket') private readonly ticketsModel: Model<ITicket>,
    @InjectModel('User') private readonly usersModel: Model<IUser>,
    @InjectModel('Project') private readonly projectModel: Model<IProject>,
  ) {}

  LIMIT: number = 25;

  async getAll(page: number = 1): Promise<object> {
    try {
      const total = await this.ticketsModel.countDocuments();
      const tickets = await this.ticketsModel
        .find()
        .limit(this.LIMIT)
        .skip(this.LIMIT * (page - 1))
        .populate('author assignee project')
        .exec();

      if (!tickets) {
        throw new NotFoundException("Can't get tickets...");
      }
      let meta = prepareMeta(page, this.LIMIT, total);
      let data = { meta, data: tickets };

      return data;
    } catch (error) {
      throw new BadRequestException(error.message);
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
      throw new BadRequestException(error.message);
    }
  }

  async create(createTicketDTO: CreateTicketDTO): Promise<any> {
    let { project: id, status, assignee } = createTicketDTO;
    let { columns }: any = await this.projectModel.findOne({ _id: id });
    let isValid = validateColumnName(columns, status);

    if (!isValid) {
      throw new BadRequestException(`Project doesn't have '${status}' column.`);
    }

    const newTicket = await this.ticketsModel(createTicketDTO);

    try {
      // Search for assigned user if exists push ticket to tickets[]
      if (assignee) {
        if (!ObjectID.isValid(assignee)) {
          throw new BadRequestException(
            `Assignee ID: '${assignee}' is not valid.`,
          );
        }
        await this.usersModel
          .findByIdAndUpdate(
            { _id: assignee },
            { $push: { tickets: newTicket._id } },
          )
          .catch(err => {
            throw new BadRequestException(err);
          });
      }
      if (id) {
        if (!ObjectID.isValid(id)) {
          throw new BadRequestException(`Project ID: '${id}' is not valid.`);
        }
        await this.projectModel
          .findByIdAndUpdate({ _id: id }, { $push: { tickets: newTicket._id } })
          .exec()
          .catch(err => {
            throw new BadRequestException(err);
          });
      }

      let ticket = newTicket
        .save()
        .then(ticket =>
          ticket.populate('author assignee project').execPopulate(),
        );
      return ticket;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(ID: string, createTicketDTO: CreateTicketDTO): Promise<ITicket> {
    try {
      const updatedTicket = await this.ticketsModel
        .findByIdAndUpdate(ID, createTicketDTO, { new: true })
        .populate('assignee author');
      return updatedTicket;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(ID: string): Promise<any> {
    try {
      const deletedTicket = await this.ticketsModel.findByIdAndRemove(ID);
      if (!deletedTicket)
        throw new BadRequestException(`Ticket with id: ${ID} doesn't exist`);
      return { msg: 'OK' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
