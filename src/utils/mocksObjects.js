const userObj = {
  name: 'Andy Silva',
  email: 'andy@teste.com',
  password: 'senhaSuperSecretaAndy',
};

const emailError = {
  email: 'and@teste.com',
  password: 'senhaSuperSecretaAndy',
};

const passwordError = {
  email: 'andy@teste.com',
  password: 'senhaSuperSecreta',
};

const correctLogin = {
  email: 'andy@teste.com',
  password: 'senhaSuperSecretaAndy',
};

const recipeObj = {
  name: 'Bolo de chocolate',
  ingredients: 'Trigo, chocolate, ovo, manteiga',
  preparation: '10 min no forno',
};

module.exports = {
  userObj,
  emailError,
  passwordError,
  correctLogin,
  recipeObj,
};
