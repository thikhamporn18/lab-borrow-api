const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Book = require('../models/book.model'); // 🔥 ต้องนำเข้า Book Model เพื่อจัดการสถานะหนังสือ

// ฟังก์ชันสร้าง Token
function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '1d' }
  );
}

// 1. ลงทะเบียนสมาชิก (Register)
exports.register = async (req, res) => {
  const { username, displayName, password } = req.body || {};
  if (!username || !displayName || !password) {
    return res.status(400).json({ error: { message: 'ข้อมูลไม่ครบ' } });
  }
  
  const dup = await User.findOne({ username: username.toLowerCase() });
  if (dup) return res.status(409).json({ error: { message: 'username ถูกใช้แล้ว' } });
  
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    username: username.toLowerCase(),
    displayName,
    passwordHash,
    role: 'staff' // ค่าเริ่มต้นเป็น staff
  });

  const token = signToken(user);
  return res.json({
    token,
    user: { id: user._id.toString(), username: user.username, displayName: user.displayName, role: user.role }
  });
};

// 2. เข้าสู่ระบบ (Login)
exports.login = async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: { message: 'ข้อมูลไม่ครบ' } });

  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user) return res.status(401).json({ error: { message: 'username/password ไม่ถูกต้อง' } });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: { message: 'username/password ไม่ถูกต้อง' } });

  const token = signToken(user);
  return res.json({
    token,
    user: { id: user._id.toString(), username: user.username, displayName: user.displayName, role: user.role }
  });
};

// 3. ตรวจสอบข้อมูลผู้ใช้ปัจจุบัน (Get Me)
exports.me = async (req, res) => {
  const user = await User.findById(req.user.id).select('username displayName role');
  if (!user) return res.status(404).json({ error: { message: 'ไม่พบผู้ใช้' } });
  res.json({ id: user._id.toString(), username: user.username, displayName: user.displayName, role: user.role });
};

// 4. แสดงข้อมูลสมาชิกทั้งหมด (Admin Only)
exports.getAllUsers = async (req, res) => {
  try {
    // ดึงรายชื่อทุกคนโดยไม่เอา passwordHash
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 5. ลบสมาชิก (Admin Only) พร้อมคืนหนังสืออัตโนมัติ
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id; 
    
    // 🔥 ขั้นตอนสำคัญ: คืนหนังสือทุกเล่มที่ User คนนี้ยืมค้างไว้
    // หาหนังสือที่ borrowedBy ตรงกับ ID ที่จะลบ แล้วตั้งค่ากลับเป็นว่าง (available)
    await Book.updateMany(
      { borrowedBy: userId }, 
      { status: 'available', borrowedBy: null }
    );

    // ทำการลบ User ออกจากฐานข้อมูล
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ error: { message: 'ไม่พบผู้ใช้งานที่ต้องการลบ' } });
    }
    
    res.json({ message: 'ลบบัญชีผู้ใช้และคืนหนังสือที่ค้างอยู่เรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
};