
/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
export class CreateUserInput {
    role: string;
    email: string;
    username: string;
    firstname: string;
    lastname: string;
    password: string;
    profilePicture?: string;
}

export class UpdateUserInput {
    role?: string;
    email?: string;
    username?: string;
    firstname?: string;
    lastname?: string;
    password?: string;
    profilePicture?: string;
    tickets?: string[];
}

export class Auth {
    username: string;
    token: string;
}

export abstract class IMutation {
    abstract createUser(user?: CreateUserInput): User | Promise<User>;

    abstract updateUser(id: string, user?: UpdateUserInput): User | Promise<User>;

    abstract deleteUser(id: string): string | Promise<string>;
}

export abstract class IQuery {
    abstract users(): User[] | Promise<User[]>;

    abstract user(id: string): User | Promise<User>;
}

export class User {
    id: string;
    role?: string;
    email?: string;
    username?: string;
    firstname?: string;
    lastname?: string;
    password?: string;
    profilePicture?: string;
    createdAt?: string;
    updatedAt?: string;
}
