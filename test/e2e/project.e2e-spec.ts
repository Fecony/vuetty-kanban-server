import axios from 'axios';
import request from 'supertest';
import { LoginUserDto } from '../../src/users/dto/login-user.dto';
import { app, database } from './constants';
import { getFormattedColumnName } from '../../src/common/utils/column-name.utils';
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
  author: 'da',
};

let column = {
  column: {
    name: 'Testing Column',
  },
};

beforeAll(async () => {
  await mongoose.connect(database, {
    useNewUrlParser: true,
  });
  await mongoose.connection.db.dropDatabase();

  await axios
    .post(`${app}/auth/register`, user)
    .then(({ data }) => {
      currentUser = Object.assign({}, data.user, {
        token: data.token,
      });
      project.author = currentUser.id;
    })
    .catch(error => {
      console.log('ERROR: ', error);
    });
});

afterAll(async done => {
  await mongoose.disconnect(done);
});

describe('Projects Controller', () => {
  it('should list empty project []', () => {
    return request(app)
      .get('/projects')
      .expect(({ body }) => {
        expect(body.meta.page).toEqual(1);
        expect(body.data).toEqual([]);
      })
      .expect(200);
  });

  it('should create project', () => {
    return request(app)
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
    return request(app)
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
    return request(app)
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
    return request(app)
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
    return request(app)
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
    return request(app)
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
    return request(app)
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
    return request(app)
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
    return request(app)
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
    return request(app)
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
    return request(app)
      .delete(`/projects?id=${currentProject._id}`)
      .set('Authorization', `Bearer ${currentUser.token}`)
      .set('Accept', 'application/json')
      .expect(({ body }) => {
        expect(body.ok).toBeTruthy();
      })
      .expect(200);
  });

  it('should return mongoose error message when using invalid _id', () => {
    return request(app)
      .delete('/projects?id=123')
      .set('Authorization', `Bearer ${currentUser.token}`)
      .set('Accept', 'application/json')
      .expect(({ body }) => {
        expect(body.message).toBe("ID: '123' is not valid.");
      })
      .expect(400);
  });
});
