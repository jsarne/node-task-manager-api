const mongoose = require('mongoose');

const dbUser = process.env.MONGODB_USER;
const dbPass = process.env.MONGODB_PASSWORD;
const cluster = process.env.MONGODB_CLUSTER;
const dbName = process.env.MONGODB_NAME;
const connectOptions = '?retryWrites=true&w=majority'
const connectionURL = `mongodb+srv://${dbUser}:${dbPass}@${cluster}/${dbName}${connectOptions}`;

mongoose.connect(connectionURL, {
  useNewUrlParser: true, 
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
