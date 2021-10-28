const { forbiddenMsg } = require('../utils/messages');

const verifyAdmin = (request, response, next) => {
  const { role } = request.body;
  try {
    if (!role || role !== 'admin') throw forbiddenMsg;

    next();
  } catch (err) {
    return next(err);
  }
};

module.exports = verifyAdmin;
