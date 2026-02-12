const Transaction = require('../models/transaction.model');
const Book = require('../models/book.model');

// ยืมหนังสือ
exports.borrowBook = async (req, res) => {
  try {
    const { book_id } = req.body;
    const user_id = req.user.id; // ได้จาก Token

    // 1. สร้าง Transaction บันทึกประวัติ
    const newTrans = new Transaction({ user_id, book_id });
    await newTrans.save();

    // 2. 🔥 อัปเดตหนังสือ: เปลี่ยนสถานะ และบันทึกว่า "ใครยืม" (borrowedBy)
    await Book.findByIdAndUpdate(book_id, { 
      status: 'borrowed',
      borrowedBy: user_id // ใส่ ID ของคนที่ยืมลงในหนังสือเล่มนั้น
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

    // 1. อัปเดต Transaction ว่าคืนแล้ว
    const trans = await Transaction.findByIdAndUpdate(
      transaction_id,
      { status: 'returned', return_date: new Date() },
      { new: true }
    );

    // 2. 🔥 อัปเดตหนังสือ: เปลี่ยนสถานะกลับ และล้างชื่อคนยืมออก (เป็น null)
    await Book.findByIdAndUpdate(trans.book_id, { 
      status: 'available',
      borrowedBy: null // ล้างชื่อคนยืมออกเพื่อให้หนังสือว่าง
    });

    res.json(trans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2.2.10 ดูประวัติการยืมของฉัน (My History)
exports.getMyHistory = async (req, res) => {
  try {
    const history = await Transaction.find({ user_id: req.user.id })
      .populate('book_id') // ดึงข้อมูลหนังสือมาโชว์
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