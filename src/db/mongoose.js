const mongoose = require('mongoose');

const dbName = 'task-manager-api';
const connectOptions = '?retryWrites=true&w=majority'
const connectionURL = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${dbName}${connectOptions}`;

mongoose.connect(connectionURL, {
  useNewUrlParser: true, 
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
