const fs   = require('fs');
const path = require('path');
const { Song, Artist, Album, sequelize } = require('../models');
const { Op } = require('sequelize');

// include dùng chung
const songInclude = [
  { model: Artist, as: 'artist', attributes: ['id', 'name', 'avatarUrl'] },
  { model: Album,  as: 'album',  attributes: ['id', 'title', 'coverUrl'] },
];

// GET /api/songs
const getAll = async (req, res) => {
  try {
    const songs = await Song.findAll({
      include: songInclude,
      order: [['createdAt', 'DESC']],
    });
    res.json({ data: songs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/songs/top?limit=10
const getTop = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const songs = await Song.findAll({
      include: songInclude,
      order: [['playCount', 'DESC']],
      limit,
    });
    res.json({ data: songs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/songs/search?q=keyword
// FIX: tìm theo tên bài + tên nghệ sĩ dùng subquery thay vì $artist.name$
const search = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ data: [] });

    // Tìm artist có tên khớp trước
    const artists = await Artist.findAll({
      where: { name: { [Op.like]: `%${q}%` } },
      attributes: ['id'],
    });
    const artistIds = artists.map(a => a.id);

    const songs = await Song.findAll({
      include: songInclude,
      where: {
        [Op.or]: [
          { title:    { [Op.like]: `%${q}%` } },
          ...(artistIds.length ? [{ artistId: { [Op.in]: artistIds } }] : []),
        ],
      },
    });
    res.json({ data: songs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/songs/:id
const getOne = async (req, res) => {
  try {
    const song = await Song.findByPk(req.params.id, { include: songInclude });
    if (!song) return res.status(404).json({ error: 'Không tìm thấy bài hát' });
    res.json({ data: song });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/songs/:id/play — tăng lượt nghe
const countPlay = async (req, res) => {
  try {
    const song = await Song.findByPk(req.params.id);
    if (!song) return res.status(404).json({ error: 'Không tìm thấy bài hát' });
    await song.increment('playCount');
    res.json({ data: { playCount: song.playCount + 1 } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/songs/:id/stream — stream nhạc, hỗ trợ tua (Range Request)
const stream = async (req, res) => {
  try {
    const song = await Song.findByPk(req.params.id);
    if (!song) return res.status(404).json({ error: 'Không tìm thấy bài hát' });

    // Nếu là link ngoài thì redirect thẳng
    if (song.audioUrl.startsWith('http')) return res.redirect(song.audioUrl);

    const filePath = path.resolve(song.audioUrl);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File nhạc không tồn tại' });

    const fileSize = fs.statSync(filePath).size;
    const range    = req.headers.range;

    if (range) {
      const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
      const start = parseInt(startStr, 10);
      const end   = endStr ? parseInt(endStr, 10) : fileSize - 1;
      res.writeHead(206, {
        'Content-Range':  `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges':  'bytes',
        'Content-Length': end - start + 1,
        'Content-Type':   'audio/mpeg',
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type':   'audio/mpeg',
        'Accept-Ranges':  'bytes',
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/songs — upload bài hát mới
const create = async (req, res) => {
  try {
    const { title, artistId, albumId, duration } = req.body;
    if (!title || !artistId)
      return res.status(400).json({ error: 'Thiếu tên bài hát hoặc nghệ sĩ' });

    const audioFile = req.files?.audio?.[0];
    const coverFile = req.files?.cover?.[0];
    if (!audioFile) return res.status(400).json({ error: 'Vui lòng upload file nhạc MP3' });

    const song = await Song.create({
      title,
      artistId: parseInt(artistId),
      albumId:  albumId ? parseInt(albumId) : null,
      duration: parseInt(duration) || 0,
      audioUrl: audioFile.path.replace(/\\/g, '/'),
      coverUrl: coverFile ? coverFile.path.replace(/\\/g, '/') : null,
    });

    const full = await Song.findByPk(song.id, { include: songInclude });
    res.status(201).json({ data: full });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/songs/:id — cập nhật thông tin bài hát
const update = async (req, res) => {
  try {
    const song = await Song.findByPk(req.params.id);
    if (!song) return res.status(404).json({ error: 'Không tìm thấy bài hát' });

    const { title, artistId, albumId, duration } = req.body;
    const coverFile = req.files?.cover?.[0];

    await song.update({
      title:    title    || song.title,
      artistId: artistId ? parseInt(artistId) : song.artistId,
      albumId:  albumId  ? parseInt(albumId)  : song.albumId,
      duration: duration ? parseInt(duration) : song.duration,
      coverUrl: coverFile ? coverFile.path.replace(/\\/g, '/') : song.coverUrl,
    });

    const full = await Song.findByPk(song.id, { include: songInclude });
    res.json({ data: full });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/songs/:id
const remove = async (req, res) => {
  try {
    const song = await Song.findByPk(req.params.id);
    if (!song) return res.status(404).json({ error: 'Không tìm thấy bài hát' });
    await song.destroy();
    res.json({ data: { message: 'Đã xóa bài hát thành công' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, getTop, search, getOne, countPlay, stream, create, update, remove };
