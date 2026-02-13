const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book.controller');

router.get('/', bookController.getBooks);
router.post('/', bookController.createBook);
router.get('/:id', bookController.getBookById);
router.delete('/:id', bookController.deleteBook);
router.put('/:id', bookController.updateBook);

module.exports = router;