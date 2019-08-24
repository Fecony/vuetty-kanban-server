import 'dotenv/config';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { LoginUserDto } from '../../src/users/dto/login-user.dto';
import { getFormattedColumnName } from '../../src/common/utils/column-name.utils';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from '../../src/projects/projects.module';
import { AuthModule } from '../../src/auth/auth.module';

const mongoose = require('mongoose');

let currentUser;
let currentProject;

let user: LoginUserDto = {
  email: 'testing_user@email.com',
  password: 'password',
};

let project = {
  title: 'Testing Project',
  description: 'Testing project description',
  author: null,
};

let column = {
  column: {
    name: 'Testing Column',
  },
};

describe('Projects Controller', () => {
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
        ProjectsModule,
        AuthModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    await request(app.getHttpServer()) // Create user
      .post('/auth/register')
      .set('Accept', 'application/json')
      .send(user)
      .expect(({ body }) => {
        currentUser = Object.assign({}, body.user, {
          token: body.token,
        });
        project.author = currentUser.id;
      });
  });

  it('should list empty project []', () => {
    return request(app.getHttpServer())
      .get('/projects')
      .expect(({ body }) => {
        expect(body.meta.page).toEqual(1);
        expect(body.data).toEqual([]);
      })
      .expect(200);
  });

  it('should create project', () => {
    return request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${currentUser.token}`)
      .set('Accept', 'application/json')
      .send(project)
      .expect(({ body }) => {
        currentProject = body;
        expect(body._id).toBeDefined();
        expect(body.title).toBe(project.title);
        expect(body.description).toEqual(project.description);
        expect(body.author).toBe(currentUser.id);
        expect(body.tickets).toEqual([]);
        expect(body.columns).toEqual([]);
        expect(body.code).toEqual('TP');
      })
      .expect(201);
  });

  it('should return project by ID', () => {
    return request(app.getHttpServer())
      .get(`/projects/${currentProject._id}`)
      .expect(({ body }) => {
        expect(body._id).toBeDefined();
        expect(body.title).toBe(project.title);
        expect(body.description).toEqual(project.description);
        expect(body.author).toBe(currentUser.id);
        expect(body.tickets).toEqual([]);
        expect(body.columns).toEqual([]);
        expect(body.code).toEqual('TP');
      })
      .expect(200);
  });

  it('should update project', () => {
    let updatedDesc = 'Testing Updated project description';
    return request(app.getHttpServer())
      .put(`/projects?id=${currentProject._id}`)
      .set('Authorization', `Bearer ${currentUser.token}`)
      .set('Accept', 'application/json')
      .send({
        description: updatedDesc,
      })
      .expect(({ body }) => {
        expect(body._id).toBeDefined();
        expect(body.title).toBe(project.title);
        expect(body.description).not.toEqual(project.description);
        expect(body.description).toEqual(updatedDesc);
        expect(body.author).toBe(currentUser.id);
        expect(body.tickets).toEqual([]);
        expect(body.columns).toEqual([]);
        expect(body.code).toEqual('TP');
      })
      .expect(200);
  });

  it('should create project column', () => {
    return request(app.getHttpServer())
      .put(`/projects/column?id=${currentProject._id}`)
      .set('Authorization', `Bearer ${currentUser.token}`)
      .set('Accept', 'application/json')
      .send(column)
      .expect(({ body }) => {
        expect(body.ok).toBeTruthy();
      })
      .expect(200);
  });

  it('should fail on adding already existing column', () => {
    return request(app.getHttpServer())
      .put(`/projects/column?id=${currentProject._id}`)
      .set('Authorization', `Bearer ${currentUser.token}`)
      .set('Accept', 'application/json')
      .send(column)
      .expect(({ body }) => {
        expect(body.message).toBe('Column Already exists');
      });
  });

  it('should contain new column', () => {
    let name = getFormattedColumnName(column.column.name);
    return request(app.getHttpServer())
      .get(`/projects/${currentProject._id}`)
      .expect(({ body: { columns } }) => {
        expect(columns[0]).toEqual(
          expect.objectContaining({
            name,
            order: 1,
          }),
        );
      })
      .expect(200);
  });

  it('should update column', () => {
    let name = getFormattedColumnName(column.column.name);
    let updatedColumn = { column: { name: 'updated name' } };
    return request(app.getHttpServer())
      .patch(`/projects/${currentProject._id}?column=${name}`)
      .set('Authorization', `Bearer ${currentUser.token}`)
      .set('Accept', 'application/json')
      .send(updatedColumn)
      .expect(({ body }) => {
        expect(body.ok).toBeTruthy();
      })
      .expect(200);
  });

  it('should contain updated column', () => {
    let updatedColumn = { column: { name: 'updated name' } };
    let name = getFormattedColumnName(updatedColumn.column.name);
    return request(app.getHttpServer())
      .get(`/projects/${currentProject._id}`)
      .set('Authorization', `Bearer ${currentUser.token}`)
      .set('Accept', 'application/json')
      .expect(({ body: { columns } }) => {
        expect(columns[0]).toEqual(
          expect.objectContaining({
            name,
            order: 1,
          }),
        );
      })
      .expect(200);
  });

  it('should delete column', () => {
    let updatedColumnName = { column: 'updated name' };
    return request(app.getHttpServer())
      .delete(`/projects/column?id=${currentProject._id}`)
      .set('Authorization', `Bearer ${currentUser.token}`)
      .set('Accept', 'application/json')
      .send(updatedColumnName)
      .expect(({ body }) => {
        expect(body.ok).toBeTruthy();
      })
      .expect(200);
  });

  it('should fail delete', () => {
    let updatedColumnName = { column: 'updated name' };
    let name = getFormattedColumnName(updatedColumnName.column);
    return request(app.getHttpServer())
      .delete(`/projects/column?id=${currentProject._id}`)
      .set('Authorization', `Bearer ${currentUser.token}`)
      .set('Accept', 'application/json')
      .send(updatedColumnName)
      .expect(({ body }) => {
        expect(body.message).toBe(
          `Column '${name}' doesn't exist in 'Testing Project' project.`,
        );
      })
      .expect(400);
  });

  it('should delete project', () => {
    return request(app.getHttpServer())
      .delete(`/projects?id=${currentProject._id}`)
      .set('Authorization', `Bearer ${currentUser.token}`)
      .set('Accept', 'application/json')
      .expect(({ body }) => {
        expect(body.ok).toBeTruthy();
      })
      .expect(200);
  });

  it('should return mongoose error message when using invalid _id', () => {
    return request(app.getHttpServer())
      .delete('/projects?id=123')
      .set('Authorization', `Bearer ${currentUser.token}`)
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
