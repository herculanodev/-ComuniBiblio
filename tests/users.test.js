const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/users');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: './.env.test' });

let token;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URL_TEST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});  // Limpar a base de dados de testes antes de cada execução
  const user = new User({
    name: 'John Doe',
    email: 'john@example.com',
    password: await bcrypt.hash('123456', 10)
  });
  await user.save();

  const res = await request(app)
    .post('/users/login')
    .send({
      email: 'john@example.com',
      password: '123456'
    });

  console.log('Login response:', res.body); // Log para verificar a resposta de login
  token = res.body.token;
});

describe('User Endpoints', () => {
  it('should create a new user', async () => {
    const res = await request(app)
      .post('/users')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: '123456'
      });
    console.log('User creation response:', res.body); // Log para verificar a resposta
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('auth');
    expect(res.body.auth).toBe(true);
    expect(res.body).toHaveProperty('token');
  });

  it('should login a user', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({
        email: 'john@example.com',
        password: '123456'
      });

    console.log('Login response:', res.body);  // Adicione este log para verificar a resposta de login
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('auth');
    expect(res.body.auth).toBe(true);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should get user by id', async () => {
    const user = await User.findOne({ email: 'john@example.com' });

    const res = await request(app)
      .get(`/users/${user._id}`)
      .set('Authorization', `Bearer ${token}`);

    console.log('Get user by id response:', res.body);  // Adicione este log para verificar a resposta de obter usuário por ID
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'John Doe');
  });
});
