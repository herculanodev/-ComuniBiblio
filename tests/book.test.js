const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Book = require('../models/book');
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
  await Book.deleteMany({});
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

describe('Book Endpoints', () => {
  it('should create a new book', async () => {
    const user = await User.findOne({ email: 'john@example.com' });
    console.log('User:', user);  // Adicione este log para verificar se o usuário está sendo encontrado
    const res = await request(app)
      .post('/books')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Moby Dick',
        author: 'Herman Melville',
        description: 'A story about a giant whale',
        genre: 'Adventure',
        publishedDate: '1851-11-14',
        userId: user._id
      });
    console.log('Book creation response:', res.body);  // Adicione este log para verificar a resposta de criação do livro
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('title', 'Moby Dick');
  });

  it('should get all books', async () => {
    const res = await request(app).get('/books');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get a book by id', async () => {
    const user = await User.findOne({ email: 'john@example.com' });
    const book = await Book.create({
      title: 'Moby Dick',
      author: 'Herman Melville',
      description: 'A story about a giant whale',
      genre: 'Adventure',
      publishedDate: '1851-11-14',
      userId: user._id
    });

    const res = await request(app).get(`/books/${book._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('title', 'Moby Dick');
  });

  it('should update a book', async () => {
    const user = await User.findOne({ email: 'john@example.com' });
    const book = await Book.create({
      title: 'Moby Dick',
      author: 'Herman Melville',
      description: 'A story about a giant whale',
      genre: 'Adventure',
      publishedDate: '1851-11-14',
      userId: user._id
    });

    const res = await request(app)
      .put(`/books/${book._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Moby Dick Updated',
        author: 'Herman Melville Updated'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('title', 'Moby Dick Updated');
  });

  it('should delete a book', async () => {
    const user = await User.findOne({ email: 'john@example.com' });
    const book = await Book.create({
      title: 'Moby Dick',
      author: 'Herman Melville',
      description: 'A story about a giant whale',
      genre: 'Adventure',
      publishedDate: '1851-11-14',
      userId: user._id
    });

    const res = await request(app)
      .delete(`/books/${book._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(204);
  });
});
