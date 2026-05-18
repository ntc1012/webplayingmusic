# 📋 API Contract — Music Web App

> BASE_URL: `http://localhost:5000/api`  
> Format lỗi: `{ "error": "mô tả lỗi" }`  
> Format thành công: `{ "data": ... }`  
> Auth header: `Authorization: Bearer <token>`

---

## 🎵 Songs

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/songs` | ❌ | Danh sách tất cả bài hát |
| GET | `/songs/top?limit=10` | ❌ | Top bài nghe nhiều nhất |
| GET | `/songs/search?q=keyword` | ❌ | Tìm kiếm theo tên / nghệ sĩ |
| GET | `/songs/:id` | ❌ | Chi tiết 1 bài hát |
| GET | `/songs/:id/stream` | ❌ | Stream file nhạc (hỗ trợ Range) |
| PATCH | `/songs/:id/play` | ❌ | Tăng lượt nghe |
| POST | `/songs` | ✅ | Upload bài hát mới (multipart) |
| DELETE | `/songs/:id` | ✅ | Xóa bài hát |

### Song Object
```json
{
  "id": 1,
  "title": "Chúng Ta Của Hiện Tại",
  "coverUrl": "https://...",
  "audioUrl": "https://...",
  "duration": 253,
  "playCount": 1500000,
  "artist": { "id": 1, "name": "Sơn Tùng M-TP", "avatarUrl": "https://..." },
  "album":  { "id": 1, "title": "Sky Tour", "coverUrl": "https://..." }
}
```

---

## 👤 Auth

| Method | Endpoint | Body | Mô tả |
|--------|----------|------|-------|
| POST | `/auth/register` | `{ name, email, password }` | Đăng ký |
| POST | `/auth/login` | `{ email, password }` | Đăng nhập → trả token |
| GET | `/auth/me` | — | Lấy thông tin user hiện tại |

### Login Response
```json
{
  "data": {
    "token": "eyJ...",
    "user": { "id": 1, "name": "Tên", "email": "a@b.com", "role": "user" }
  }
}
```

---

## 🎤 Artists

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/artists` | Danh sách nghệ sĩ |
| GET | `/artists/:id` | Chi tiết nghệ sĩ + bài hát + album |

---

## ❤️ Favorites (cần login)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/favorites` | Danh sách bài yêu thích |
| POST | `/favorites/:songId` | Thêm vào yêu thích |
| DELETE | `/favorites/:songId` | Xóa khỏi yêu thích |

---

## 📃 Playlists (cần login)

| Method | Endpoint | Body | Mô tả |
|--------|----------|------|-------|
| GET | `/playlists` | — | Danh sách playlist của user |
| POST | `/playlists` | `{ name }` | Tạo playlist mới |
| DELETE | `/playlists/:id` | — | Xóa playlist |
| POST | `/playlists/:id/songs` | `{ songId }` | Thêm bài vào playlist |
| DELETE | `/playlists/:id/songs/:songId` | — | Xóa bài khỏi playlist |

---

## 🛠️ Mock Server (FE dùng khi BE chưa xong)

```bash
# Cài json-server
npm install -g json-server

# Chạy mock server (từ thư mục gốc)
npm run mock
# → http://localhost:3001/songs
# → http://localhost:3001/artists
```
