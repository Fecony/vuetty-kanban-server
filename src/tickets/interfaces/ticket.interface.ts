import { Document } from 'mongoose';
import { IUser } from '../../users/interfaces/user.interface';
import { IProject } from '../../projects/interfaces/project.interface';

export interface ITicket extends Document {
  _id: string;
  title: string;
  description: string;
  author: IUser;
  assignee: IUser;
  status: string;
  project: IProject;
  ticket_code: string;
  due_date: string;
  estimate: number;
  remaining: number;
  attachments: string;
  comments: string;
}
