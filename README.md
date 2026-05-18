# 🎵 Web Nghe Nhạc — Backend

> Đây là phần backend cho đồ án môn Công nghệ Web.  
> Viết bằng Node.js + Express + MySQL.  
> Nếu mày chỉ cần làm FE thì không cần cài cái này — đọc phần **"FE không muốn đụng vào BE"** bên dưới trước.

---

## Dành cho FE — đọc cái này trước

Tao đã chuẩn bị sẵn một mock server, mày chạy được luôn mà **không cần cài MySQL hay bất cứ thứ gì phức tạp**.

**Bước 1** — Clone repo về:
```bash
git clone https://github.com/ntc1012/webplayingmusic.git
cd webplayingmusic
npm install
```

**Bước 2** — Chạy mock server:
```bash
npm run mock
```

Vậy là xong. Mày có ngay server giả ở `http://localhost:3001` với data bài hát thật để test.

> Khi tao báo "API thật xong rồi" thì mày chỉ cần đổi BASE_URL từ  
> `http://localhost:3001` → `http://localhost:5000/api` là xong, không cần sửa gì khác.

---

## Dành cho BE — cài đầy đủ

### 1. Clone và cài thư viện
```bash
npm install
```

### 2. Tạo file .env
Copy từ `.env.example`, sửa lại thông tin MySQL:
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=music_db
DB_USER=root
DB_PASS=
JWT_SECRET=musicapp_secret_key_2024
JWT_EXPIRES_IN=7d
### 3. Tạo database
Mở phpMyAdmin, chạy:
```sql
CREATE DATABASE music_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Chạy server
```bash
npm run dev
```

### 5. Seed data mẫu
```bash
node seed.js
```

---

## Tài khoản test

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Admin | admin@music.com | admin123 |
| User | user@music.com | user123 |

---

## API đang có

Xem file `API_CONTRACT.md` để biết đầy đủ. Những route cần login thì gửi kèm header:
Authorization: Bearer <token>
