import 'dotenv/config';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { LoginUserDto } from '../../src/users/dto/login-user.dto';
import { AuthModule } from '../../src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';

const mongoose = require('mongoose');

const user: LoginUserDto = {
  email: 'some@user.com',
  password: 'password',
};

describe('Authorization Controller', () => {
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
        AuthModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('should register user', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .set('Accept', 'application/json')
      .send(user)
      .expect(({ body }) => {
        expect(body.user.email).toEqual(user.email);
        expect(body.user.password).toBeUndefined();
        expect(body.token).toBeDefined();
      })
      .expect(201);
  });

  it('should fail duplicate registration', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .set('Accept', 'application/json')
      .send(user)
      .expect(({ body }) => {
        expect(body.message).toEqual(
          `User with email: ${user.email} already exists`,
        );
      })
      .expect(400);
  });

  it('should login created user', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .set('Accept', 'application/json')
      .send(user)
      .expect(({ body }) => {
        expect(body.user.email).toEqual(user.email);
        expect(body.user.password).toBeUndefined();
        expect(body.token).toBeDefined();
      })
      .expect(201);
  });

  it('should fail user login with not existing email', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .set('Accept', 'application/json')
      .send({ email: 'dontexist@user.com', password: user.password })
      .expect(({ body }) => {
        expect(body.message).toBe("User doesn't exist!");
      })
      .expect(400);
  });

  it('should fail user login without credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .set('Accept', 'application/json')
      .expect(({ body }) => {
        expect(body.message).toEqual('Email and Password are required!');
      })
      .expect(403);
  });

  afterAll(async done => {
    await app.close();
    await mongoose.disconnect(done);
  });
});
