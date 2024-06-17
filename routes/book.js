const express = require('express');
const router = express.Router();
const booksController = require('../controllers/book');
const auth = require('../middlewares/auth');

router.post('/', auth.verifyToken, booksController.createBook);
router.get('/', booksController.getAllBooks);
router.get('/:id', booksController.getBookById);
router.put('/:id', auth.verifyToken, booksController.updateBook);
router.delete('/:id', auth.verifyToken, booksController.deleteBook);

module.exports = router;
''