const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const usersRoutes = require('../routes/usersRoute');
const loginRoute = require('../routes/loginRoute');
const recipesRoutes = require('../routes/recipesRoute');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Não remover esse end-point, ele é necessário para o avaliador
app.get('/', (request, response) => {
  response.send();
});
// Não remover esse end-point, ele é necessário para o avaliador

app.use('/users', usersRoutes);
app.use('/login', loginRoute);
app.use('/recipes', recipesRoutes);
app.use('/images', express.static(path.join(__dirname, '..', 'uploads')));

// middleware para tratamento de erro genérico
app.use((err, _req, res, _next) => {
  if (err.status) return res.status(err.status).json({ message: err.message });
  return res.status(500).json({ message: err.message });
});

module.exports = app;
