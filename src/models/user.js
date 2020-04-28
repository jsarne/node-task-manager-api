const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const validator = require('validator');
const Task = require('./task');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate: {
      validator: (val) => validator.isEmail(val),
      message: 'Email is invalid'
    }
  },
  age: {
    type: Number,
    default: 0,
    validate: {
      validator: (val) => val >= 0,
      message: 'Age is a positive number yo!'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    trim: true,
    validate: {
      validator: (val) => !val.toLowerCase().includes('password'),
      message: 'The word password cannot exist in your password. Try again.'
    }
  },
  avatar: {
    type: Buffer
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
});

// make "tasks" a virtual field that relates _id to Task.owner
userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
});

userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;
  delete userObject.avatarMimeType;
  return userObject;
}

// instance method to generate auth token, need access to this so not arrow
userSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign({_id: this._id.toString()}, process.env.JWT_SECRET);
    this.tokens = this.tokens.concat({token});
    await this.save();
    return token;      
  } catch (e) {
    console.log(e);
    return undefined;
  }
};

// static login method, no this so arrow
userSchema.statics.findByCredentials = async (email, password) => {
  try {
    const user = await User.findOne({email});
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const validPwd = await bcrypt.compare(password, user.password);
    if (!validPwd) {
      throw new Error('Invalid credentials');
    }
  
    return user;      
  } catch (e) {
    console.log(e);
    throw new Error('Invalid credentials');
  }
};

// need access to this to work with the user being saved, so can't use arrow function
// password encryption
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

userSchema.pre('remove', async function (next) {
  await Task.deleteMany({owner: this._id});
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;