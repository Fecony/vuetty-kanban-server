import axios from 'axios';
import request from 'supertest';
import { LoginUserDto } from '../../src/users/dto/login-user.dto';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';
import { app, database } from './constants';
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

beforeAll(async () => {
  await mongoose.connect(database, {
    useNewUrlParser: true,
  });
  await mongoose.connection.db.dropDatabase();

  await axios // Create 'admin'
    .post(`${app}/auth/register`, admin)
    .then(async ({ data }) => {
      createdAdmin = Object.assign({}, data.user, {
        token: data.token,
      });
      var config = {
        headers: { Authorization: 'Bearer ' + createdAdmin.token },
      };
      project.author = data.user.id;
      ticket.author = data.user.id;

      return await axios // Create Project
        .post(`${app}/projects`, project, config)
        .then(async ({ data }) => {
          createdProject = data;
          ticket.project = data._id;

          return await axios // Create column
            .put(
              `${app}/projects/column?id=${createdProject._id}`,
              column,
              config,
            )
            .then(async () => {
              return await axios // Create user
                .post(`${app}/users`, newUser, config)
                .then(({ data }) => {
                  createdUser = data;
                  ticket.assignee = data._id;
                });
            });
        });
    })
    .catch(error => {
      console.log('ERROR: ', error);
    });
});

afterAll(async done => {
  await mongoose.disconnect(done);
});

describe('Tickets Controller', () => {
  it('should return empty array of tickets[]', () => {
    return request(app)
      .get('/tickets')
      .expect(({ body: { meta, data } }) => {
        expect(meta.page).toEqual(1);
        expect(data).toEqual([]);
      })
      .expect(200);
  });

  it('should create ticket', () => {
    return request(app)
      .post('/tickets')
      .set('Authorization', `Bearer ${createdAdmin.token}`)
      .set('Accept', 'application/json')
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

  it('should return mongoose error message when using invalid _id', () => {
    return request(app)
      .delete('/tickets?id=123')
      .set('Authorization', `Bearer ${createdAdmin.token}`)
      .set('Accept', 'application/json')
      .expect(({ body }) => {
        expect(body.message).toBe("ID: '123' is not valid.");
      })
      .expect(400);
  });
});
