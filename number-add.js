const debug = require('debug');

module.exports = (a, b) => {
  debug('value a: ', a);
  debug('value b: ', b);

  return a + b;
};
