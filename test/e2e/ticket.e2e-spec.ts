import request from 'supertest';
import { LoginUserDto } from '../../src/users/dto/login-user.dto';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';
import { INestApplication } from '@nestjs/common';
import { AuthModule } from '../../src/auth/auth.module';
import { TicketsModule } from '../../src/tickets/tickets.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { ProjectsModule } from '../../src/projects/projects.module';

const mongoose = require('mongoose');

let createdAdmin;
let createdUser;
let createdProject;
let createdTicket;

let admin: LoginUserDto = {
  email: 'admin@email.com',
  password: 'password',
};
let newUser: CreateUserDto = {
  email: 'junior@email.com',
  password: 'password',
  firstname: 'First',
  lastname: 'Lastname',
  role: 'very junior',
  username: 'h4373R',
};
let project = {
  title: 'Test Project',
  description: 'Project Description',
  author: null,
};
let column = {
  column: {
    name: 'to do',
  },
};
let ticket = {
  status: 'to do',
  title: 'Ticket title',
  description: 'Ticket Description',
  author: null,
  assignee: null,
  project: null,
};

describe.only('Ticket Controller', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL_TEST, {
      useNewUrlParser: true,
    });
    await mongoose.connection.db.dropDatabase();

    const module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: async () => ({
            uri: process.env.MONGO_URL_TEST,
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
          }),
        }),
        TicketsModule,
        ProjectsModule,
        AuthModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    await request(app.getHttpServer()) // Create admin
      .post('/auth/register')
      .set('Accept', 'application/json')
      .send(admin)
      .expect(({ body }) => {
        createdAdmin = Object.assign({}, body.user, {
          token: body.token,
        });
        project.author = body.user.id;
        ticket.author = body.user.id;
      });

    await request(app.getHttpServer()) // Create user
      .post('/users')
      .set('Authorization', `Bearer ${createdAdmin.token}`)
      .send(newUser)
      .expect(({ body }) => {
        createdUser = body;
        ticket.assignee = body._id;
      });

    await request(app.getHttpServer()) // Create project
      .post('/projects')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${createdAdmin.token}`)
      .send(project)
      .expect(async ({ body }) => {
        createdProject = body;
        ticket.project = body._id;
      });

    await request(app.getHttpServer()) // Create column
      .put(`/projects/column?id=${createdProject._id}`)
      .set('Authorization', `Bearer ${createdAdmin.token}`)
      .send(column)
      .expect(200);
  });

  it('should return empty array of tickets[]', () => {
    return request(app.getHttpServer())
      .get('/tickets')
      .expect(({ body: { meta, data } }) => {
        expect(meta.page).toEqual(1);
        expect(data).toEqual([]);
      })
      .expect(200);
  });

  it('should create ticket', async () => {
    return await request(app.getHttpServer())
      .post('/tickets')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${createdAdmin.token}`)
      .send(ticket)
      .expect(({ body }) => {
        createdTicket = body;
        expect(body.status).toBe('TO_DO');
        expect(body.title).toBe(ticket.title);
        expect(body.description).toEqual(ticket.description);
        expect(body.author._id).toBe(ticket.author);
        expect(body.assignee._id).toBe(ticket.assignee);
        expect(body.project._id).toBe(ticket.project);
      })
      .expect(201);
  });

  it('should fail creating ticket with not existing column', async () => {
    let nticket = ticket;
    nticket.status = 'not existing';
    return await request(app.getHttpServer())
      .post('/tickets')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${createdAdmin.token}`)
      .send(nticket)
      .expect(({ body }) => {
        expect(body.message).toBe(
          `Project doesn't have '${nticket.status}' column.`,
        );
      })
      .expect(400);
  });

  it('should return ticket by ID', () => {
    return request(app.getHttpServer())
      .get(`/tickets/${createdTicket._id}`)
      .expect(({ body }) => {
        expect(body._id).toBeDefined();
        expect(body._id).toBe(createdTicket._id);
        expect(body.title).toBe(createdTicket.title);
        expect(body.description).toEqual(createdTicket.description);
        expect(body.author._id).toBe(createdAdmin.id);
        expect(body.assignee._id).toBe(createdUser._id);
        expect(body.project._id).toBe(createdProject._id);
        expect(body.ticket_code).toBeDefined();
        expect(body.ticket_code).toBe('TP-0');
      })
      .expect(200);
  });

  it('user should have ticket in tickets[]', () => {
    return request(app.getHttpServer())
      .get(`/users/${createdUser._id}`)
      .set('Accept', 'application/json')
      .expect(({ body }) => {
        expect(body.tickets).toContainEqual(
          expect.objectContaining({ _id: createdTicket._id }),
        );
      })
      .expect(200);
  });

  it('should update ticket', () => {
    let updatedDesc = 'Testing Updated ticket description';
    return request(app.getHttpServer())
      .put(`/tickets?id=${createdTicket._id}`)
      .set('Authorization', `Bearer ${createdAdmin.token}`)
      .set('Accept', 'application/json')
      .send({
        description: updatedDesc,
      })
      .expect(({ body }) => {
        expect(body.description).not.toEqual(createdTicket.description);
        expect(body.description).toEqual(updatedDesc);
        createdTicket = body;
      })
      .expect(200);
  });

  it('should delete ticket', () => {
    return request(app.getHttpServer())
      .delete(`/tickets?id=${createdTicket._id}`)
      .set('Authorization', `Bearer ${createdAdmin.token}`)
      .set('Accept', 'application/json')
      .expect(({ body }) => {
        expect(body.ok).toBeTruthy();
      })
      .expect(200);
  });

  it('user should not contain removed ticket in tickets[]', () => {
    return request(app.getHttpServer())
      .get(`/users/${createdUser._id}`)
      .set('Accept', 'application/json')
      .expect(({ body }) => {
        expect(body.tickets).not.toContainEqual(
          expect.objectContaining({ _id: createdTicket._id }),
        );
      })
      .expect(200);
  });

  it('should return mongoose error message when using invalid _id', () => {
    return request(app.getHttpServer())
      .delete('/tickets?id=123')
      .set('Authorization', `Bearer ${createdAdmin.token}`)
      .set('Accept', 'application/json')
      .expect(({ body }) => {
        expect(body.message).toBe("ID: '123' is not valid.");
      })
      .expect(400);
  });

  afterAll(async done => {
    await app.close();
    await mongoose.disconnect(done);
  });
});
