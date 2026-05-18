require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { sequelize } = require('./models');

const app = express();

// ─── MIDDLEWARE ──────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // port mặc định của Vite
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve file ảnh và nhạc đã upload
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── ROUTES ──────────────────────────────────────
app.use('/api', require('./routes'));

// Route không tồn tại
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} không tồn tại` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Lỗi server không xác định' });
});

// ─── KHỞI ĐỘNG ───────────────────────────────────
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công');

    // sync({ alter: true }) — tự cập nhật bảng nếu thay đổi model
    // KHÔNG dùng force: true trong production (xóa hết data)
    await sequelize.sync({ alter: true });
    console.log('✅ Đồng bộ database thành công');

    app.listen(PORT, () => {
      console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
      console.log(`📦 API tại http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('❌ Không thể kết nối database:', err.message);
    process.exit(1);
  }
};

start();
