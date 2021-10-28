const { INVALID_ENTRIES, DUPLICITY_EMAIL } = require('./errorMessages');
const { BAD_REQUEST, CONFLICT } = require('./statusErrors');

const badRequest = { status: BAD_REQUEST, message: INVALID_ENTRIES };
const conflict = { status: CONFLICT, message: DUPLICITY_EMAIL };

module.exports = {
  badRequest,
  conflict,
};