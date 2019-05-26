import * as mongoose from 'mongoose';

export const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, default: 'dumb project' },
    code: { type: String, unique: true, required: true },
    description: String,
    columns: [
      {
        type: String,
        unique: true,
        default: 'TODO',
      },
    ],
  },
  { timestamps: true },
);
