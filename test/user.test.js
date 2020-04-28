const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const mail = require('./__mocks__/@sendgrid/mail');
const {userOneId, userOne, populateDatabase, closeDatabaseConnection} = require('./fixtures/db');

beforeEach(populateDatabase);
afterAll(closeDatabaseConnection);

test('should sign up a new user, sign them in, and send them an email', async () => {
  const emailSpy = jest.spyOn(mail, 'send');
  const resp = await request(app).post('/users').send({
    name: 'Test User N',
    email: 'jim.sarne+jestn@gmail.com',
    password: '99pass99'
  })
  expect(resp.status).toBe(201);
  expect(resp.body.user).toBeDefined();
  expect(resp.body.token).toBeDefined();
  expect(emailSpy).toBeCalled();
  const user = await User.findById(resp.body.user._id);
  expect(user).not.toBeNull();
});

test('should log in existing user', async () => {
  const resp = await request(app).post('/users/login').send({
    email: userOne.email,
    password: userOne.password
  });
  expect(resp.status).toBe(200);
  expect(resp.body.user).toBeDefined();
  expect(resp.body.token).toBeDefined();
});

test('invalid password should not log in the user', async () => {
  const resp = await request(app).post('/users/login').send({
    email: userOne.email,
    password: 'bogus'
  });
  expect(resp.status).toBe(400);
  expect(resp.body.token).toBeUndefined();
});

test('should get profile for authenticated user', async () => {
  const resp = await request(app).get('/users/me').set('Authorization', `Bearer ${userOne.tokens[0].token}`).send();
  expect(resp.status).toBe(200);
  expect(resp.body.email).toBe(userOne.email);
});

test('should not get profile for unauthenticated user', async () => {
  const resp = await request(app).get('/users/me').send();
  expect(resp.status).toBe(401);
  expect(resp.body.email).toBeUndefined();
});

test('should delete account for authenticated user', async () => {
  const resp = await request(app).delete('/users/me').set('Authorization', `Bearer ${userOne.tokens[0].token}`).send();
  expect(resp.status).toBe(200);
  const userCt = await User.findById(userOneId).countDocuments();
  expect(userCt).toBe(0);
});

test('should not delete account for unauthenticated user', async () => {
  const resp = await request(app).delete('/users/me').set('Authorization', `Bearer badtoken`).send();
  expect(resp.status).toBe(401);
  const userCt = await User.findById(userOneId).countDocuments();
  expect(userCt).toBe(1);
});

test('should update', async () => {
  const resp = await request(app).patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'New Name'
    });
  expect(resp.status).toBe(200);
  const user = await User.findById(userOneId);
  expect(user.name).toBe('New Name');
});

test('should not update fields you cannot update', async () => {
  const resp = await request(app).patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      tokens: ['cannot set this in update']
    });
  expect(resp.status).toBe(400);
});