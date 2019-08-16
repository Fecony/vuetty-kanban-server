export class CreateProjectDTO {
  readonly title: string;
  readonly code: object;
  readonly description?: string;
  readonly author: string;
  readonly columns: [string];
}
