import { Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  code: string;
  description?: string;
  author: string;
  columns: [object];
  tickets: [string];
}
