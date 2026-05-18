GET /api/songs
→ [{ id, title, artistName, coverUrl, audioUrl, duration, playCount }]

GET /api/songs/:id
→ { id, title, artistName, albumName, coverUrl, audioUrl, duration }

GET /api/songs/top?limit=10
→ [{ id, title, artistName, coverUrl, audioUrl, playCount }]

GET /api/artists
→ [{ id, name, avatarUrl, bio }]

POST /api/auth/register  body: { email, password, name }
POST /api/auth/login     body: { email, password } → { token, user }
