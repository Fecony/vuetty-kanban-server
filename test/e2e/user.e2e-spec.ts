import 'dotenv/config';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../../src/auth/auth.module';
import { LoginUserDto } from '../../src/users/dto/login-user.dto';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';
import { UsersModule } from '../../src/users/users.module';
import { TicketSchema } from '../../src/tickets/schemas/ticket.schema';

const mongoose = require('mongoose');

let adminUser;
let createdUser;

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
const testImage = `${__dirname}/../images.png`;

describe('Users Controller', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL_TEST, {
      useNewUrlParser: true,
    });
    mongoose.model('Ticket', TicketSchema); // IDK why
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
        UsersModule,
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
        adminUser = Object.assign({}, body.user, {
          token: body.token,
        });
      });
  });

  it('should return array of users containing new admin user', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(({ body: { meta, data } }) => {
        expect(data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              _id: adminUser.id,
              email: adminUser.email,
              role: adminUser.role,
              tickets: [],
            }),
          ]),
        );
        expect(meta.page).toEqual(1);
      })
      .expect(200);
  });

  it('should create user', () => {
    return request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${adminUser.token}`)
      .set('Accept', 'application/json')
      .send(newUser)
      .expect(({ body }) => {
        createdUser = body;
        expect(body.role).toBe(newUser.role);
        expect(body.email).toBe(newUser.email);
        expect(body.firstname).toEqual(newUser.firstname);
        expect(body.lastname).toBe(newUser.lastname);
        expect(body.tickets).toEqual([]);
      })
      .expect(201);
  });

  it('should fail on creating same user', () => {
    return request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${adminUser.token}`)
      .set('Accept', 'application/json')
      .send(newUser)
      .expect(({ body }) => {
        expect(body.message).toEqual(
          `User with email: ${createdUser.email} already exists`,
        );
      })
      .expect(400);
  });

  it('should return user by ID', () => {
    return request(app.getHttpServer())
      .get(`/users/${createdUser._id}`)
      .expect(({ body }) => {
        expect(body._id).toBeDefined();
        expect(body.role).toBe(newUser.role);
        expect(body.email).toBe(newUser.email);
        expect(body.firstname).toEqual(newUser.firstname);
        expect(body.lastname).toBe(newUser.lastname);
        expect(body.tickets).toEqual([]);
      })
      .expect(200);
  });

  it('should update user', () => {
    let role = 'Middle Frontend Developer';
    let username = 'Elliot';
    return request(app.getHttpServer())
      .put(`/users?id=${createdUser._id}`)
      .set('Authorization', `Bearer ${adminUser.token}`)
      .set('Accept', 'application/json')
      .send({
        role,
        username,
      })
      .expect(({ body }) => {
        expect(body._id).toBeDefined();
        expect(body.role).not.toEqual(newUser.role);
        expect(body.username).not.toEqual(newUser.username);
        expect(body.username).toEqual(username);
        expect(body.role).toBe(role);
        createdUser = body;
      })
      .expect(200);
  });

  it('should upload avatar', () => {
    return request(app.getHttpServer())
      .post(`/users/${createdUser._id}/avatar`)
      .set('Authorization', `Bearer ${adminUser.token}`)
      .attach('avatar', testImage, { contentType: 'application/octet-stream' })
      .expect(({ body }) => {
        expect(body.ok).toBeTruthy();
      });
  });

  it('should contain avatar name', () => {
    return request(app.getHttpServer())
      .get(`/users/${createdUser._id}`)
      .expect(({ body }) => {
        expect(body.profilePicture).toBeDefined();
        expect(body.profilePicture).toEqual(expect.stringMatching(/^avatar-/));
        createdUser = body;
      })
      .expect(200);
  });

  it('should return avatar by name', () => {
    return request(app.getHttpServer())
      .get(`/users/avatars/${createdUser.profilePicture}`)
      .set('Authorization', `Bearer ${adminUser.token}`)
      .expect(({ body }) => {
        expect(body).toBeInstanceOf(Buffer);
      })
      .expect(200);
  });

  it('should delete user and return ok', () => {
    return request(app.getHttpServer())
      .delete(`/users?id=${createdUser._id}`)
      .set('Authorization', `Bearer ${adminUser.token}`)
      .set('Accept', 'application/json')
      .expect(({ body }) => {
        expect(body.ok).toBeTruthy();
      })
      .expect(200);
  });

  it('should return error message when trying to delete not existing user', () => {
    return request(app.getHttpServer())
      .delete(`/users?id=${createdUser._id}`)
      .set('Authorization', `Bearer ${adminUser.token}`)
      .set('Accept', 'application/json')
      .expect(({ body }) => {
        expect(body.message).toBe(
          `User with ID: ${createdUser._id} doesn't exist`,
        );
      })
      .expect(400);
  });

  it('should return mongoose error message when using invalid _id', () => {
    return request(app.getHttpServer())
      .delete('/users?id=123')
      .set('Authorization', `Bearer ${adminUser.token}`)
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
