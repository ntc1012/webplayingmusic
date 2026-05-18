# 🎵 Music Web — Backend

## Cài đặt & Chạy

### 1. Cài dependencies
```bash
npm install
```

### 2. Tạo file .env
```bash
cp .env.example .env
# Sửa DB_USER, DB_PASS, DB_NAME cho khớp với MySQL của bạn
```

### 3. Tạo database MySQL
```sql
CREATE DATABASE music_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Chạy server (tự tạo bảng)
```bash
npm run dev
```

### 5. Seed dữ liệu mẫu
```bash
node seed.js
```

### 6. Chạy mock server cho FE (không cần DB)
```bash
npm run mock
# → http://localhost:3001
```

## Tài khoản mẫu (sau khi seed)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@music.com | admin123 |
| User  | user@music.com  | user123  |

## Cấu trúc thư mục
```
src/
├── config/       database.js
├── controllers/  authController, songController, userController, artistController
├── middlewares/  auth.js (JWT), upload.js (Multer)
├── models/       index.js (tất cả model + associations)
├── routes/       index.js
└── index.js      entry point
uploads/
├── songs/        file mp3
└── covers/       ảnh bìa
mock/
└── db.json       dữ liệu giả cho FE
```
