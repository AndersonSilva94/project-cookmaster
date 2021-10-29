const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const { expect } = chai;
const sinon = require('sinon');
const server = require('../api/app');
const { MongoClient, ObjectId } = require('mongodb');
const { getConnection } = require('./connectionMocks');
const { userObj, correctLogin,
  recipeObj, recipeObjModify, adminObj, correctLoginAdmin } = require('../utils/mocksObjects');

describe('POST /recipes', () => {
  let connectionMock;

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  });

  after(() => {
    MongoClient.connect.restore();
  });

  describe('Valida se os campos name, ingredients e preparation são obrigatórios', () => {
    let response;

    before(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.insertOne(userObj);

      const { body: { token } } = await chai.request(server).post('/login').send(correctLogin);

      // console.log(token);
      // .set({ Authorization: `Bearer ${token}` })

      // como passar o token na requisição encontrado no link:
      // https://stackoverflow.com/questions/59858287/testing-jwt-authentication-using-mocha-and-chai

      response = await chai.request(server).post('/recipes').set('Authorization', token)
        .send({})
    });

    after(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.deleteOne({
        email: 'andy@teste.com'
      });
    });

    it('retorna status "400"', (done) => {
      expect(response).to.have.status(400);
      done();
    });
    it('"message" tem o valor "Invalid entries. Try again."', (done) => {
      expect(response.body.message).to.be.equals('Invalid entries. Try again.');
      done();
    });
  });

  describe('Valida que não é possível criar receita com token inválido', () => {
    let response;

    before(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.insertOne(userObj);

      response = await chai.request(server).post('/recipes').set('Authorization', 'erer')
        .send({})
    });

    after(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.deleteOne({
        email: 'andy@teste.com'
      });
    });

    it('retorna status "401"', (done) => {
      expect(response).to.have.status(401);
      done();
    });
    it('"message" tem o valor "jwt malformed"', (done) => {
      expect(response.body.message).to.be.equals('jwt malformed');
      done();
    });
  });

  describe('Valida que é possível cadastrar receita com sucesso', () => {
    let response;

    before(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.insertOne(userObj);

      const { body: { token } } = await chai.request(server).post('/login').send(correctLogin);

      response = await chai.request(server).post('/recipes').set('Authorization', token)
        .send(recipeObj)
    });

    after(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.deleteOne({
        email: 'andy@teste.com'
      });
    });

    it('retorna status "201"', (done) => {
      expect(response).to.have.status(201);
      done();
    });
    it('retorna o objeto "recipe"', () => {
      expect(response.body.recipe).to.have.all
        .keys(['name', 'ingredients', 'preparation', '_id', 'userId']);
    });
  });
});

describe('GET /recipes', () => {
  let connectionMock;

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  });

  after(() => {
    MongoClient.connect.restore();
  });

  describe('Valida que é possível listar as receitas sem estar autenticado', () => {
    let response;

    before(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.insertOne(userObj);

      const { body: { token } } = await chai.request(server).post('/login').send(correctLogin);

      await chai.request(server).post('/recipes').set('Authorization', token)
        .send(recipeObj)

      response = await chai.request(server).get('/recipes')
    });

    after(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.deleteOne({
        email: 'andy@teste.com'
      });
    });

    it('retorna status "200"', (done) => {
      expect(response).to.have.status(200);
      done();
    });

    // como verificar se é um array encontrado no link
    // https://devhints.io/chai
    it('retorna um array', (done) => {
      expect(response.body).to.be.a('array');
      done();
    });
  });

  describe('Valida que é possível listar as receitas estando autenticado', () => {
    let response;

    before(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.insertOne(userObj);

      const { body: { token } } = await chai.request(server).post('/login').send(correctLogin);

      await chai.request(server).post('/recipes').set('Authorization', token)
        .send(recipeObj)

      response = await chai.request(server).get('/recipes').set('Authorization', token)
    });

    after(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.deleteOne({
        email: 'andy@teste.com'
      });
    });

    it('retorna status "200"', (done) => {
      expect(response).to.have.status(200);
      done();
    });
    it('retorna um array', (done) => {
      expect(response.body).to.be.a('array');
      done();
    });
  });
});

describe('GET /recipes/:id', () => {
  let connectionMock;

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  });

  after(() => {
    MongoClient.connect.restore();
  });

  describe('Valida que é possível listar uma receita específica sem autenticação', () => {
    let response;

    before(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.insertOne(userObj);

      const { body: { token } } = await chai.request(server).post('/login').send(correctLogin);

      const { body: { recipe: { _id: idRecipe } } } = await chai.request(server)
        .post('/recipes').set('Authorization', token).send(recipeObj)
      // console.log(idRecipe)
      response = await chai.request(server).get(`/recipes/${idRecipe}`)
    });

    after(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.deleteOne({
        email: 'andy@teste.com'
      });
    });

    it('retorna status "200"', (done) => {
      expect(response).to.have.status(200);
      done();
    });
    it('retorna as informações da receita', (done) => {
      expect(response.body).to.have.all
        .keys(['name', 'ingredients', 'preparation', '_id', 'userId']);
      done();
    });
  });

  describe('Valida que é possível listar uma receita específica com autenticação', () => {
    let response;

    before(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.insertOne(userObj);

      const { body: { token } } = await chai.request(server).post('/login').send(correctLogin);

      const { body: { recipe: { _id: idRecipe } } } = await chai.request(server)
        .post('/recipes').set('Authorization', token).send(recipeObj)

      response = await chai.request(server).get(`/recipes/${idRecipe}`).set('Authorization', token)
    });

    after(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.deleteOne({
        email: 'andy@teste.com'
      });
    });

    it('retorna status "200"', (done) => {
      expect(response).to.have.status(200);
      done();
    });
    it('retorna as informações da receita', (done) => {
      expect(response.body).to.have.all
        .keys(['name', 'ingredients', 'preparation', '_id', 'userId']);
      done();
    });
  });

  describe('Valida que não é possível listar uma receita que não existe', () => {
    let response;

    before(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.insertOne(userObj);

      const { body: { token } } = await chai.request(server).post('/login').send(correctLogin);

      response = await chai.request(server).get('/recipes/617bb4b35c0e605c3cc951rt')
    });

    after(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.deleteOne({
        email: 'andy@teste.com'
      });
    });

    it('retorna status "404"', (done) => {
      expect(response).to.have.status(404);
      done();
    });
    it('"message" tem o valor "recipe not found"', (done) => {
      expect(response.body.message).to.be.equals('recipe not found');
      done();
    });
  });
});

describe('PUT /recipes/:id', () => {
  let connectionMock;

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  });

  after(() => {
    MongoClient.connect.restore();
  });

  describe('Valida que não é possível editar uma receita sem autenticação', () => {
    let response;

    before(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.insertOne(userObj);

      const { body: { token } } = await chai.request(server).post('/login').send(correctLogin);

      const { body: { recipe: { _id: idRecipe } } } = await chai.request(server)
        .post('/recipes').set('Authorization', token).send(recipeObj)

      response = await chai.request(server).put(`/recipes/${idRecipe}`)
    });

    after(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.deleteOne({
        email: 'andy@teste.com'
      });
    });

    it('retorna status "401"', (done) => {
      expect(response).to.have.status(401);
      done();
    });
    it('"message" tem o valor "missing auth token"', (done) => {
      expect(response.body.message).to.be.equals('missing auth token');
      done();
    });
  });

  describe('Valida que não é possível editar uma receita com token inválido', () => {
    let response;

    before(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.insertOne(userObj);

      const { body: { token } } = await chai.request(server).post('/login').send(correctLogin);

      const { body: { recipe: { _id: idRecipe } } } = await chai.request(server)
        .post('/recipes').set('Authorization', token).send(recipeObj)

      response = await chai.request(server).put(`/recipes/${idRecipe}`)
        .set('Authorization', 'erer');
    });

    after(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.deleteOne({
        email: 'andy@teste.com'
      });
    });

    it('retorna status "401"', (done) => {
      expect(response).to.have.status(401);
      done();
    });
    it('"message" tem o valor "jwt malformed"', (done) => {
      expect(response.body.message).to.be.equals('jwt malformed');
      done();
    });
  });

  describe('Valida que é possível editar uma receita autenticado', () => {
    let response;

    before(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.insertOne(userObj);

      const { body: { token } } = await chai.request(server).post('/login').send(correctLogin);

      const { body: { recipe: { _id: idRecipe } } } = await chai.request(server)
        .post('/recipes').set('Authorization', token).send(recipeObj)

      response = await chai.request(server).put(`/recipes/${idRecipe}`)
        .set('Authorization', token).send(recipeObjModify);
    });

    after(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.deleteOne({
        email: 'andy@teste.com'
      });
    });

    it('retorna status "200"', (done) => {
      expect(response).to.have.status(200);
      done();
    });
    it('retorna as informações da receita modificada', (done) => {
      expect(response.body).to.have.all
        .keys(['name', 'ingredients', 'preparation', '_id', 'userId']);
      done();
    });
  });

  describe('Valida que é possível editar uma receita com usuário admin', () => {
    let response;

    before(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.insertOne(adminObj);

      const { body: { token } } = await chai.request(server).post('/login')
        .send(correctLoginAdmin);

      const { body: { recipe: { _id: idRecipe } } } = await chai.request(server)
        .post('/recipes').set('Authorization', token).send(recipeObj)

      response = await chai.request(server).put(`/recipes/${idRecipe}`)
        .set('Authorization', token).send(recipeObjModify);
    });

    after(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.deleteOne({
        email: 'andy@teste.com'
      });
    });

    it('retorna status "200"', (done) => {
      expect(response).to.have.status(200);
      done();
    });
    it('retorna as informações da receita modificada', (done) => {
      expect(response.body).to.have.all
        .keys(['name', 'ingredients', 'preparation', '_id', 'userId']);
      done();
    });
  });
});
