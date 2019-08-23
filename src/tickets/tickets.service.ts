import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ITicket } from './interfaces/ticket.interface';
import { CreateTicketDTO } from './dto/create-ticket.dto';
import { IUser } from '../users/interfaces/user.interface';
import { IProject } from '../projects/interfaces/project.interface';
import { prepareMeta } from '../common/utils/prepare-meta.util';
import { validateColumnName } from '../common/utils/validate-column.utils';
import { validateMongoId } from '../common/utils/validate-id.utils';

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
    let { code, columns } = await this.projectModel.findOne({ _id: id });
    let lastTicket = await this.ticketsModel.findOne(
      {},
      {},
      { sort: { createdAt: -1 } },
    );

    let ticket_code = `${code}-0as`;

    if (lastTicket && lastTicket.ticket_code) {
      ticket_code = getTicketCode(lastTicket.ticket_code, code);
    }
    let isValid = validateColumnName(columns, status);

    if (!isValid) {
      throw new BadRequestException(`Project doesn't have '${status}' column.`);
    }

    let ticket = Object.assign({}, createTicketDTO, { ticket_code });
    const newTicket = await this.ticketsModel(ticket);

    try {
      if (assignee) {
        // Search for assigned user if exists push ticket to tickets[]
        validateMongoId(assignee);
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
        // Add ticket to projects
        validateMongoId(id);
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

  async update(ID: string, createTicketDTO: CreateTicketDTO) {
    let { assignee } = createTicketDTO;

    try {
      if (assignee) {
        let oldAssigneeId = await this.getById(ID).then(
          result => result.assignee._id,
        );
        validateMongoId(assignee);

        await this.usersModel // Reassign ticket to new user
          .findByIdAndUpdate({ _id: assignee }, { $push: { tickets: ID } })
          .catch(err => {
            throw new BadRequestException(err);
          });

        await this.usersModel // Remove ticket from old assignee ticket[]
          .findByIdAndUpdate({ _id: oldAssigneeId }, { $pull: { tickets: ID } })
          .catch(err => {
            throw new BadRequestException(err);
          });
      }

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
      let assigneeId = await this.getById(ID).then(
        result => result.assignee._id,
      );

      await this.usersModel // Remove ticket from old assignee ticket[]
        .findByIdAndUpdate({ _id: assigneeId }, { $pull: { tickets: ID } })
        .catch(err => {
          throw new BadRequestException(err);
        });

      const deletedTicket = await this.ticketsModel.findByIdAndRemove(ID);
      if (!deletedTicket)
        throw new BadRequestException(`Ticket with id: ${ID} doesn't exist`);
      return { ok: true };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}

function getTicketCode(lastCode: any, code: string): string {
  let lastNumber = lastCode.split(`${code}-`).pop();
  lastNumber += 1;
  let ticket_code = `${code}-${lastNumber}`;
  return ticket_code;
}
