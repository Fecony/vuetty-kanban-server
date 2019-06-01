
/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
export class CreateProjectInput {
    title?: string;
    description?: string;
}

export class CreateTicketInput {
    title?: string;
    description?: string;
    author?: string;
    assignee?: string;
    status?: string;
    due_date?: string;
    estimate?: string;
    project?: string;
    ticket_code?: string;
    attachments?: string[];
}

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

export class Deleted {
    deleted?: boolean;
    msg?: string;
}

export abstract class IMutation {
    abstract createProject(project?: CreateProjectInput): Project | Promise<Project>;

    abstract updateProject(id: string, project?: CreateProjectInput): Project | Promise<Project>;

    abstract deleteProject(id: string): Project | Promise<Project>;

    abstract addColumn(id: string, column: string): ProjectColumn | Promise<ProjectColumn>;

    abstract deleteColumn(id: string, column?: string): ProjectColumn | Promise<ProjectColumn>;

    abstract createUser(user?: CreateUserInput): User | Promise<User>;

    abstract updateUser(id: string, user?: UpdateUserInput): User | Promise<User>;

    abstract deleteUser(id: string): Deleted | Promise<Deleted>;
}

export class Mutations {
    createTicket?: Ticket;
    updateTicket?: Ticket;
    deleteTicket?: Ticket;
}

export class Project {
    id: string;
    title?: string;
    code?: string;
    description?: string;
    columns?: string[];
    createdAt?: string;
    updatedAt?: string;
}

export class ProjectColumn {
    ok: boolean;
    error?: string;
}

export abstract class IQuery {
    abstract projects(): Project[] | Promise<Project[]>;

    abstract project(id: string): Project | Promise<Project>;

    abstract tickets(): Ticket[] | Promise<Ticket[]>;

    abstract ticket(id: string): Ticket | Promise<Ticket>;

    abstract users(): User[] | Promise<User[]>;

    abstract user(id: string): User | Promise<User>;
}

export class Ticket {
    id: string;
    title?: string;
    description?: string;
    author?: User;
    assignee?: User;
    status?: string;
    due_date?: string;
    estimate?: string;
    project?: Project;
    ticket_code?: string;
    attachments?: string[];
    comments?: string[];
    created_at?: string;
    updated_at?: string;
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
    tickets?: Ticket[];
    createdAt?: string;
    updatedAt?: string;
}
