export class CreateTicketDTO {
  readonly title: string;
  readonly description: string;
  readonly author: string;
  readonly assignee: string;
  readonly status: string;
  readonly project: string;
  readonly ticket_code: string;
  readonly due_date: string;
  readonly estimate: number;
  readonly remaining: number;
  readonly attachments: [string];
  readonly comments: [string];
}
