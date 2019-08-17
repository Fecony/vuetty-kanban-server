import { Document } from 'mongoose';

export interface IColumn extends Document {
  name: string;
  status: number;
}
