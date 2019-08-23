import 'dotenv/config';
import request from 'supertest';
import { app, database } from './constants';
import { LoginUserDto } from '../../src/users/dto/login-user.dto';
const mongoose = require('mongoose');

beforeAll(async () => {
  await mongoose.connect(database, {
    useNewUrlParser: true,
  });
  await mongoose.connection.db.dropDatabase();
});

afterAll(async done => {
  await mongoose.disconnect(done);
});

describe('Authorization Controller', () => {
  const user: LoginUserDto = {
    email: 'some@user.com',
    password: 'password',
  };
  let token: string;

  it('should register user', () => {
    return request(app)
      .post('/auth/register')
      .set('Accept', 'application/json')
      .send(user)
      .expect(({ body }) => {
        expect(body.user.email).toEqual(user.email);
        expect(body.user.password).toBeUndefined();
        expect(body.token).toBeDefined();
        token = body.token;
      })
      .expect(201);
  });

  it('should fail duplicate registration', () => {
    return request(app)
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
    return request(app)
      .post('/auth/login')
      .set('Accept', 'application/json')
      .send(user)
      .expect(({ body }) => {
        token = body.token;
        expect(body.user.email).toEqual(user.email);
        expect(body.user.password).toBeUndefined();
        expect(body.token).toBeDefined();
      })
      .expect(201);
  });

  it('should fail user login with wrong credentials', () => {
    return request(app)
      .post('/auth/login')
      .set('Accept', 'application/json')
      .send({ email: 'some@user.com', password: 'wrongpassword' })
      .expect(403);
  });
});
