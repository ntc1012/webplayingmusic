const { Favorite, Song, Artist, Album, Playlist, PlaylistSong } = require('../models');

const songInclude = [
  { model: Artist, as: 'artist', attributes: ['id', 'name', 'avatarUrl'] },
  { model: Album,  as: 'album',  attributes: ['id', 'title', 'coverUrl'] },
];

// ─── FAVORITES ────────────────────────────────────────

// GET /api/favorites
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { userId: req.user.id },
      include: [{ model: Song, as: 'song', include: songInclude }], // FIX: dùng as:'song' từ Favorite.belongsTo(Song)
      order: [['createdAt', 'DESC']],
    });
    const songs = favorites.map(f => f.song).filter(Boolean);
    res.json({ data: songs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/favorites/:songId
const addFavorite = async (req, res) => {
  try {
    const songId = parseInt(req.params.songId);
    const song = await Song.findByPk(songId);
    if (!song) return res.status(404).json({ error: 'Không tìm thấy bài hát' });

    const exists = await Favorite.findOne({ where: { userId: req.user.id, songId } });
    if (exists) return res.status(409).json({ error: 'Bài hát đã có trong danh sách yêu thích' });

    await Favorite.create({ userId: req.user.id, songId });
    res.status(201).json({ data: { message: 'Đã thêm vào yêu thích' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/favorites/:songId
const removeFavorite = async (req, res) => {
  try {
    const deleted = await Favorite.destroy({
      where: { userId: req.user.id, songId: parseInt(req.params.songId) },
    });
    if (!deleted) return res.status(404).json({ error: 'Bài hát không có trong yêu thích' });
    res.json({ data: { message: 'Đã xóa khỏi yêu thích' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/favorites/:songId/check — FE dùng để biết bài này có được like chưa
const checkFavorite = async (req, res) => {
  try {
    const exists = await Favorite.findOne({
      where: { userId: req.user.id, songId: parseInt(req.params.songId) },
    });
    res.json({ data: { isFavorited: !!exists } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── PLAYLISTS ────────────────────────────────────────

// GET /api/playlists
const getPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.findAll({
      where: { userId: req.user.id },
      include: [{ model: Song, as: 'songs', include: songInclude }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ data: playlists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/playlists
const createPlaylist = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Vui lòng nhập tên playlist' });
    const playlist = await Playlist.create({ name: name.trim(), userId: req.user.id });
    res.status(201).json({ data: playlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/playlists/:id — đổi tên playlist
const updatePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!playlist) return res.status(404).json({ error: 'Không tìm thấy playlist' });

    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Tên playlist không được để trống' });

    await playlist.update({ name: name.trim() });
    res.json({ data: playlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/playlists/:id
const deletePlaylist = async (req, res) => {
  try {
    const deleted = await Playlist.destroy({ where: { id: req.params.id, userId: req.user.id } });
    if (!deleted) return res.status(404).json({ error: 'Không tìm thấy playlist' });
    res.json({ data: { message: 'Đã xóa playlist' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/playlists/:id/songs
const addSongToPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!playlist) return res.status(404).json({ error: 'Không tìm thấy playlist' });

    const songId = parseInt(req.body.songId);
    if (!songId) return res.status(400).json({ error: 'Thiếu songId' });

    const song = await Song.findByPk(songId);
    if (!song) return res.status(404).json({ error: 'Không tìm thấy bài hát' });

    const exists = await PlaylistSong.findOne({ where: { playlistId: playlist.id, songId } });
    if (exists) return res.status(409).json({ error: 'Bài hát đã có trong playlist này rồi' });

    await PlaylistSong.create({ playlistId: playlist.id, songId });
    res.status(201).json({ data: { message: 'Đã thêm bài hát vào playlist' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/playlists/:id/songs/:songId
const removeSongFromPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!playlist) return res.status(404).json({ error: 'Không tìm thấy playlist' });

    await PlaylistSong.destroy({ where: { playlistId: playlist.id, songId: parseInt(req.params.songId) } });
    res.json({ data: { message: 'Đã xóa bài hát khỏi playlist' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getFavorites, addFavorite, removeFavorite, checkFavorite,
  getPlaylists, createPlaylist, updatePlaylist, deletePlaylist,
  addSongToPlaylist, removeSongFromPlaylist,
};
