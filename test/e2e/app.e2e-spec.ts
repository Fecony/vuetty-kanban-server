import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { INestApplication } from '@nestjs/common';

describe('Application', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it(`Should return pong! `, () => {
    return request(app.getHttpServer())
      .get('/')
      .expect('pong!')
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
