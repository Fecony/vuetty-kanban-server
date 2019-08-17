import * as mongoose from 'mongoose';
import { getFormattedColumnName } from '../../common/utils/column-name.utils';

export const TicketSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      default: 'TO_DO',
    },
    due_date: Date,
    estimate: Number,
    remaining: Number,
    project: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: 'Project',
    },
    ticket_code: String,
    // attachments: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Atachment',
    //   },
    // ],
    // comments: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Comment',
    //   },
    // ],
  },
  { timestamps: true },
);

TicketSchema.pre('save', function(next) {
  let ticket = this;
  if (!ticket.due_date) {
    let newDate = addDays(Date.now(), 7);
    ticket.due_date = newDate;
  }

  ticket.status = getFormattedColumnName(ticket.status);

  next();
});

function addDays(date, days: number): Date {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
