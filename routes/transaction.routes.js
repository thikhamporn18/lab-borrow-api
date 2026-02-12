const express = require('express');
const router = express.Router();
const transController = require('../controllers/transaction.controller');
const verifyToken = require('../middlewares/auth.middleware');

// ทุก Route ต้อง Login ก่อน
router.post('/borrow', verifyToken, transController.borrowBook);
router.post('/return', verifyToken, transController.returnBook);
router.get('/my-history', verifyToken, transController.getMyHistory);
router.get('/', verifyToken, transController.getAllTransactions); // Admin

module.exports = router;