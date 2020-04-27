const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');

const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
  try {
    const task = new Task({...req.body, owner: req.user._id});
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

// GET /tasks?completed=[true|false]&limit=10&skip=20&sortBy=createdAt[:asc|:desc]]
router.get('/tasks', auth, async (req, res) => {
  try {
    const match = {};
    if (req.query.completed) {
      match.completed = req.query.completed === 'true';
    }
    const sort = {};
    if (req.query.sortBy) {
      const [sortBy, sortOrder] = req.query.sortBy.split(':');
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1
    }
    const user = await req.user.populate({
      path: 'tasks', 
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
      }
    }).execPopulate();
    res.send(user.tasks);
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
    if (task) {
      res.send(task);
    } else {
      res.status(404).send();
    }
  } catch (e) {
    if (e.name === 'CastError') {
      res.status(404).send();
    } else {
      res.status(500).send(e);
    }    
  }
});

router.patch('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
    if (task) {
      const updatedFields = Object.keys(req.body);
      const modelFields = Object.keys(Task.schema.paths).filter((k) => k != '_id' && k != '__v');
      const isValidOp = updatedFields.every((f) => modelFields.includes(f));
      if (!isValidOp) {
        return res.status(400).send({'error': 'Invalid update key'});
      }
      Object.keys(req.body).forEach((k) => task[k] = req.body[k]);
      await task.save();
      res.send(task);
    } else {
      res.status(404).send();
    }
  } catch (e) {
    if (e.name === 'CastError' || e.name === 'ValidationError') {
      res.status(400).send(e.message);
    } else {
      res.status(500).send(e);
    }    
  }
});

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const deletedTask = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});
    if (deletedTask) {
      res.send(deletedTask);
    } else {
      res.status(404).send();
    }
  } catch (e) {
    if (e.name === 'CastError') {
      res.status(404).send();
    } else {
      res.status(500).send(e);
    }        
  }
});

module.exports = router;