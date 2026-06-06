const jwt = require('jsonwebtoken');

// Bắt buộc đăng nhập
const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'Bạn chưa đăng nhập' });

  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

// Không bắt buộc — dùng cho route vừa public vừa cần biết user là ai
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try { req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET); }
    catch {}
  }
  next();
};

// Chỉ admin mới được vào — dùng SAU middleware auth
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ error: 'Bạn không có quyền thực hiện thao tác này' });
  next();
};

module.exports = { auth, optionalAuth, adminOnly };
