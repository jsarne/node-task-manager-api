const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const {userOneId, userOne, userTwoTaskThree, populateDatabase, closeDatabaseConnection} = require('./fixtures/db');

beforeEach(populateDatabase);
afterAll(closeDatabaseConnection);

test('should create task for user', async () => {
  const resp = await request(app).post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: 'Task One'
    });
  expect(resp.status).toBe(201);
  const task = await Task.findById(resp.body._id);
  expect(task).not.toBeNull();
  expect(task.completed).toBe(false);
  expect(task.owner).toEqual(userOneId);
});

test('should only retrieve authenticated users tasks', async () => {
  const resp = await request(app).get('/tasks').set('Authorization', `Bearer ${userOne.tokens[0].token}`).send();
  expect(resp.status).toBe(200);
  const taskList = resp.body;
  expect(taskList.length).toBe(2);
  expect(taskList.every(t => t.owner == userOneId));
});

test('can only delete tasks you own', async () => {
  const taskIdToDelete = userTwoTaskThree._id;
  const resp = await request(app).delete(`/tasks/${taskIdToDelete}`).set('Authorization', `Bearer ${userOne.tokens[0].token}`).send();
  expect(resp.status).toBe(404);
  const task = await Task.findById(taskIdToDelete);
  expect(task).not.toBeNull();
});