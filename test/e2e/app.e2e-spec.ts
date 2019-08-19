import request from 'supertest';
import * as mongoose from 'mongoose';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { AppService } from '../../src/app.service';

describe('App', () => {
  let app: INestApplication;
  let appService = { ping: () => 'pong!' };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AppService)
      .useValue(appService)
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  it(`/GET app`, () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect(appService.ping());
  });

  afterAll(async () => {
    await app.close();
  });
});
