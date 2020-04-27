const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  console.log('auth middleware');
  try {
    const token = req.headers.authorization.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({_id: decoded._id, 'tokens.token': token});
    if (user) {
      req.user = user;
      req.token = token;
      next();
    } else {
      throw new Error;
    }
  } catch (e) {
    console.log(e);
    res.status(401).send({error: 'Please log in'});
  }
}

module.exports = auth;