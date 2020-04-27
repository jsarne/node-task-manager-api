const express = require('express');
require('./db/mongoose');
const UserRouter = require('./routers/user');
const TaskRouter = require('./routers/task');

const app = express();

app.use(express.json());
app.use(UserRouter);
app.use(TaskRouter);

app.listen(process.env.PORT, () => {
  console.log('Server is up on port ' + process.env.PORT);
});
