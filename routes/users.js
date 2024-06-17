const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const auth = require('../middlewares/auth');

router.post('/', usersController.createUser);
router.post('/login', usersController.loginUser);
router.get('/:id', auth.verifyToken, usersController.getUserById);
router.put('/:id', auth.verifyToken, usersController.updateUser);  // Certifique-se de que esta linha está correta
router.delete('/:id', auth.verifyToken, usersController.deleteUser);  // Certifique-se de que esta linha está correta

module.exports = router;
