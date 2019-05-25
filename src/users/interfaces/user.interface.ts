import { Document } from 'mongoose';

export interface IUser extends Document {
  id: string;
  role: string;
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  password: string;
  profilePicture?: string;
  tickets: [string];
}
