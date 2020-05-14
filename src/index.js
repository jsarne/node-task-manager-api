const app = require('./app');

// to run on 127.0.0.1 instead of localhost (useful for hitting this service from a device emulator)
if (process.env.HOST) {
  app.listen(process.env.PORT, process.env.HOST, () => {
    console.log(`Server is up at ${process.env.HOST}:${process.env.PORT}`);
  });  
} else {
  app.listen(process.env.PORT, () => {
    console.log(`Server is up on port ${process.env.PORT}`);
  });
}
