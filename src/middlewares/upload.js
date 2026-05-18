const multer = require('multer');
const path   = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, 'uploads/songs/');
    } else {
      cb(null, 'uploads/covers/');
    }
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['audio/mpeg', 'audio/mp3', 'image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ hỗ trợ file MP3 và ảnh JPG/PNG/WEBP'));
  }
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB
