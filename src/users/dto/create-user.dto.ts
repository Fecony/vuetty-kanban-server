export class CreateUserDto {
  readonly id?: string;
  readonly role?: string;
  readonly email: string;
  readonly password: string;
  readonly username?: string;
  readonly firstname?: string;
  readonly lastname?: string;
  readonly profilePicture?: string;
  readonly tickets?: [string];
}
