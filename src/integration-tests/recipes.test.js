const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const { expect } = chai;
const sinon = require('sinon');
const server = require('../api/app');
const { MongoClient, ObjectId } = require('mongodb');
const { getConnection } = require('./connectionMocks');
const { userObj, correctLogin, recipeObj } = require('../utils/mocksObjects');

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
    })
  })
})