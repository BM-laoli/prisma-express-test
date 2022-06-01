const { logger } = require('../utils/logger');
module.exports = {
  reqInfo: (req, res, next) => {
    logger.info({
      level: 'info',
      message: {
        reqData: Date.now(),
        requestType: req.method,
        originURL: req.originalUrl,
      },
    });
    next();
  },
};
