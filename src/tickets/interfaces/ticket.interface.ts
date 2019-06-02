import { Document } from 'mongoose';

export interface ITicket extends Document {
  title: string;
  description: string;
  author: string;
  assignee: string;
  status: string;
  project: string;
  ticket_code: string;
  due_date: string;
  estimate: string;
  attachments: string;
  comments: string;
}