const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { User } = require('../models');

const makeToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const safeUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ họ tên, email, mật khẩu' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });

    if (await User.findOne({ where: { email } }))
      return res.status(409).json({ error: 'Email này đã có tài khoản rồi' });

    const user  = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
    res.status(201).json({ data: { token: makeToken(user), user: safeUser(user) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu' });

    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });

    res.json({ data: { token: makeToken(user), user: safeUser(user) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/auth/me
const me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'createdAt']
    });
    if (!user) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
    res.json({ data: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login, me };
