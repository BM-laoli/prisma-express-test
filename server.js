const { initConnection } = require('./db');
const app = require('./app');

initConnection().then(() => {
  app.listen(3000, () => {
    console.log('server start in 3000');
  });
});
