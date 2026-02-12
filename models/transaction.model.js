const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  borrow_date: { type: Date, default: Date.now },
  due_date: { type: Date }, // กำหนดส่งคืน (เผื่อมี)
  return_date: { type: Date }, // วันที่คืนจริง
  status: { type: String, enum: ['borrowed', 'returned'], default: 'borrowed' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);