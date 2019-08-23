import 'dotenv/config';
import request from 'supertest';
import { app } from './constants';

describe('Application', () => {
  it('should return pong', () => {
    return request(app)
      .get('')
      .expect('pong!')
      .expect(200);
  });
});
