const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');
const {sendWelcomeEmail, sendGoodbyeEmail} = require('../emails/account');

const router = new express.Router();

router.post('/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({user, token});
  } catch (e) {
    res.status(400).send(e);
  }
});

const MAX_FILE_SIZE=1024*1024;
const upload = multer({
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter(req, file, cb) {
    if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('invalid file type, please upload a jpeg or png'));
    }
  }
});
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    const user = req.user;
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer();
    user.avatar = buffer;
    await user.save();
    res.send();
  } catch (e) {
    res.status(400).send();    
  }
}, (error, req, res, next) => {
  let msg = error.message;
  if (error.code === 'LIMIT_FILE_SIZE') {
    msg = msg + ` (max file size = ${MAX_FILE_SIZE/1024} bytes)`;
  }
  res.status(400).send({error: msg});
});

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.send({user, token});
  } catch (e) {
    res.status(400).send();
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    const user = req.user;  // set in auth middleware
    user.tokens = user.tokens.filter((t) => t.token !== req.token)
    await user.save();
    res.send();
  } catch (e) {
    res.status(400).send();
  }
});

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    const user = req.user;  // set in auth middleware
    user.tokens = []
    await user.save();
    res.send();
  } catch (e) {
    res.status(400).send();
  }
});

// return authenticated user
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

router.patch('/users/me', auth, async (req, res) => {
  try {
    const user = req.user;  // set in auth middleware
    const updatedFields = Object.keys(req.body);
    const modelFields = Object.keys(User.schema.paths).filter((k) => !['_id', '__v', 'tokens'].includes(k));
    const isValidOp = updatedFields.every((f) => modelFields.includes(f));
    if (!isValidOp) {
      return res.status(400).send({'error': 'Invalid update key'});
    }
    Object.keys(req.body).forEach((k) => {
      user[k] = req.body[k];
    });
    await user.save();
    res.send(user);
  } catch (e) {
    if (e.name === 'CastError' || e.name === 'ValidationError') {
      res.status(400).send(e.message);
    } else {
      res.status(500).send(e);
    }    
  }
});

router.delete('/users/me', auth, async (req, res) => {
  try {
    const user = req.user;  // set in auth middleware
    await user.remove();
    sendGoodbyeEmail(user.email, user.name);
    res.send(user);
  } catch (e) {
    if (e.name === 'CastError') {
      res.status(404).send();
    } else {
      res.status(500).send(e);
    }        
  }
});

router.delete('/users/me/avatar', auth, async (req, res) => {
  try {
    const user = req.user;
    user.avatar = undefined;
    user.avatar
    await user.save();
    res.send();      
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user && user.avatar) {
      res.set('Content-Type', 'image/png');  // all images converted to PNGs when uploaded
      res.send(user.avatar);
    } else {
      throw new Error();
    }
  } catch (e) {
    res.status(404).send();
  }
});

module.exports = router;