import * as mongoose from 'mongoose';

export const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, default: 'dumb project' },
    code: { type: String, unique: true },
    description: String,
    columns: [
      {
        type: String,
        unique: true,
        default: null,
      },
    ],
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
