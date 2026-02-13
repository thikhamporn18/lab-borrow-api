const Transaction = require('../models/transaction.model');
const Book = require('../models/book.model');

// ยืมหนังสือ
exports.borrowBook = async (req, res) => {
  try {
    const { book_id } = req.body;
    const user_id = req.user.id; 

    // สร้าง Transaction บันทึกประวัติ
    const newTrans = new Transaction({ user_id, book_id });
    await newTrans.save();

    // อัปเดตหนังสือ
    await Book.findByIdAndUpdate(book_id, { 
      status: 'borrowed',
      borrowedBy: user_id 
    });

    res.status(201).json(newTrans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// คืนหนังสือ
exports.returnBook = async (req, res) => {
  try {
    const { transaction_id } = req.body;

    // อัปเดต Transaction 
    const trans = await Transaction.findByIdAndUpdate(
      transaction_id,
      { status: 'returned', return_date: new Date() },
      { new: true }
    );

    // อัปเดตหนังสือ
    await Book.findByIdAndUpdate(trans.book_id, { 
      status: 'available',
      borrowedBy: null 
    });

    res.json(trans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ดูประวัติการยืมของฉัน (My History)
exports.getMyHistory = async (req, res) => {
  try {
    const history = await Transaction.find({ user_id: req.user.id })
      .populate('book_id') 
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ดูรายการที่ถูกยืมทั้งหมด (Admin)
exports.getAllTransactions = async (req, res) => {
  try {
    const trans = await Transaction.find()
      .populate('user_id', 'username displayName')
      .populate('book_id')
      .sort({ createdAt: -1 });
    res.json(trans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};