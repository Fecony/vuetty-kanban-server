import { Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  code: object;
  description?: string;
  author: string;
  columns: [object];
}
