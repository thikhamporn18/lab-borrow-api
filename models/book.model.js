const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  book_name: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, default: 'General' }, 
  status: { 
    type: String, 
    enum: ['available', 'borrowed'], 
    default: 'available' 
  },
  borrowedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);