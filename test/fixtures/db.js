const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/user');
const Task = require('../../src/models/task');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: 'Test User 1',
  email: 'jim.sarne+jest1@gmail.com',
  password: '11test11',
  tokens: [{
    token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
  }]
};
const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  name: 'Test User 2',
  email: 'jim.sarne+jest2@gmail.com',
  password: '22test22',
  tokens: [{
    token: jwt.sign({_id: userTwoId}, process.env.JWT_SECRET)
  }]
};

const userOneTaskOne = {
  _id: mongoose.Types.ObjectId(),
  description: 'Fixture Task 1',
  completed: false,
  owner: userOneId._id
};
const userOneTaskTwo = {
  _id: mongoose.Types.ObjectId(),
  description: 'Fixture Task 2',
  completed: true,
  owner: userOneId._id
};
const userTwoTaskThree = {
  _id: mongoose.Types.ObjectId(),
  description: 'Fixture Task 3',
  completed: false,
  owner: userTwoId._id
};


const populateDatabase = async () => {
  await User.deleteMany();
  await new User(userOne).save();
  await new User(userTwo).save();
  await Task.deleteMany();
  await new Task(userOneTaskOne).save();
  await new Task(userOneTaskTwo).save();
  await new Task(userTwoTaskThree).save();
};

const closeDatabaseConnection = async () => {
  await mongoose.connection.close();
};

module.exports = {
  userOneId, userOne,
  userTwoId, userTwo,
  userOneTaskOne, userOneTaskTwo, userTwoTaskThree,
  populateDatabase,
  closeDatabaseConnection
};