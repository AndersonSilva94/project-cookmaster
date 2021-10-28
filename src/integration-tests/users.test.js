const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const { expect } = chai;
const sinon = require('sinon');
const server = require('../api/app');
const { MongoClient, ObjectId } = require('mongodb');
const { getConnection } = require('./connectionMocks');

describe('POST /users', () => {
  let connectionMock;

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  });

  after(() => {
    MongoClient.connect.restore();
  });

  describe('Valida se campos name, email e password existem', () => {
    let response;

    before(async () => {
      response = await chai.request(server).post('/users').send({});
    })

    it('retorna status "400"', () => {
      expect(response).to.have.status(400);
    });
    /* it('retorna um objeto no body', () => {
      expect(response.body).to.be.an('object');
    });
    it('retorna um objeto com campo "message"', () => {
      expect(response.body).to.have.property('message');
    }); */
    it('"message" tem o valor "Invalid entries. Try again."', () => {
      expect(response.body.message).to.be.equals('Invalid entries. Try again.');
    })
  });

  describe('Valida se o email já não está registrado', () => {
    let response;

    before(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.insertOne({
        name: 'Andy Silva',
        email: 'andy@teste.com',
        password: 'senhaSuperSuperSecreta',
      });

      response = await chai.request(server).post('/users').send({
        name: 'Andy',
        email: 'andy@teste.com',
        password: 'senha123',
      })
    });

    after(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.deleteOne({
        email: 'andy@teste.com'
      });
    })

    it('retorna status "409"', () => {
      expect(response).to.have.status(409);
    });
    it('"message" tem o valor "Email already registered"', () => {
      expect(response.body.message).to.be.equals('Email already registered');
    })
  });

  describe('Valida que é possível cadastrar usuário com sucesso', () => {
    let response;
    let idUser;

    before(async () => {
      response = await chai.request(server).post('/users').send({
        name: 'Andy',
        email: 'andy@teste.com',
        password: 'senha123',
      });

      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      const findRecipe = await usersCollection.findOne({
        email: 'andy@teste.com'
      });
      // console.log(findRecipe)
      idUser = findRecipe._id

    });

    after(async () => {
      const usersCollection = connectionMock.db('Cookmaster').collection('users');
      await usersCollection.deleteOne({
        email: 'andy@teste.com'
      });
    })

    it('retorna status "201"', () => {
      expect(response).to.have.status(201);
    });
    /* it('retorna o objeto "user"', () => {
      const objUser = {
        user: {
          name: 'Andy',
          email: 'andy@teste.com',
          role: 'user',
          _id: ObjectId(idUser)
        }
      }
      expect(response.body).to.be.equals(objUser);
    }) */
  })
})