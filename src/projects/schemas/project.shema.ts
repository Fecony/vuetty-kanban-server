import * as mongoose from 'mongoose';

let ColumnSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: null,
      unique: true,
      required: true,
    },
    order: { type: Number, default: 0, required: true },
  },
  { _id: false, id: false },
);

export const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      default: 'dumb project',
      unique: true,
    },
    code: { type: String, unique: true },
    description: String,
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    columns: [ColumnSchema],
  },
  { timestamps: true },
);

ProjectSchema.pre('save', function(next) {
  let project = this;

  project.code = project.title
    .match(/\b(\w)/g)
    .join('')
    .toUpperCase();

  next();
});
