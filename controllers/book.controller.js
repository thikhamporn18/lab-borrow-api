const Book = require('../models/book.model');

// แสดงรายการหนังสือทั้งหมด พร้อมดึงข้อมูลคนยืม (Populate)
exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find().populate('borrowedBy', 'displayName');
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// เพิ่มรายการหนังสือ (Admin)
exports.createBook = async (req, res) => {
  try {
    const { book_name, author, category } = req.body;
    const newBook = new Book({ book_name, author, category });
    await newBook.save();
    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ดูสถานะหนังสือ (ว่าง/ถูกยืม)
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('borrowedBy', 'displayName');
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ลบหนังสือ
exports.deleteBook = async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// แก้ไขข้อมูลหนังสือ
exports.updateBook = async (req, res) => {
  try {
    const { book_name, author, category } = req.body;
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { book_name, author, category },
      { new: true } 
    );
    res.json(updatedBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};