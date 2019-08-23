export class CreateProjectDTO {
  readonly title: string;
  readonly code?: string;
  readonly description?: string;
  readonly author: string;
  readonly columns?: [string];
  readonly tickets?: [string];
}
