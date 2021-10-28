const connection = require('./connection');

const createUser = async (name, email, password) => {
  const db = await connection();
  const newUser = await db.collection('users').insertOne({ name, email, password, role: 'user' })
    .then((res) => ({ _id: res.insertedId, name, email }));

  return newUser;
};

module.exports = {
  createUser,
};