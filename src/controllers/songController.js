const fs   = require('fs');
const path = require('path');
const { Song, Artist, Album, Favorite } = require('../models');
const { Op } = require('sequelize');

const songInclude = [
  { model: Artist, as: 'artist', attributes: ['id', 'name', 'avatarUrl'] },
  { model: Album,  as: 'album',  attributes: ['id', 'title', 'coverUrl'] },
];

// GET /api/songs
const getAll = async (req, res) => {
  try {
    const songs = await Song.findAll({ include: songInclude, order: [['createdAt', 'DESC']] });
    res.json({ data: songs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/songs/top?limit=10
const getTop = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const songs = await Song.findAll({ include: songInclude, order: [['playCount', 'DESC']], limit });
    res.json({ data: songs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/songs/search?q=keyword
const search = async (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q.trim()) return res.json({ data: [] });
    const songs = await Song.findAll({
      include: songInclude,
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { '$artist.name$': { [Op.like]: `%${q}%` } },
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

// GET /api/songs/:id/stream — stream file nhạc, hỗ trợ Range (seek)
const stream = async (req, res) => {
  try {
    const song = await Song.findByPk(req.params.id);
    if (!song) return res.status(404).json({ error: 'Không tìm thấy bài hát' });

    // Nếu audioUrl là link ngoài thì redirect
    if (song.audioUrl.startsWith('http')) {
      return res.redirect(song.audioUrl);
    }

    const filePath = path.resolve(song.audioUrl);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File không tồn tại' });

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Hỗ trợ tua — trả về 206 Partial Content
      const parts  = range.replace(/bytes=/, '').split('-');
      const start  = parseInt(parts[0], 10);
      const end    = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        'Content-Range':  `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges':  'bytes',
        'Content-Length': chunkSize,
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
    if (!title || !artistId) return res.status(400).json({ error: 'Thiếu tên bài hát hoặc nghệ sĩ' });

    const audioFile = req.files?.audio?.[0];
    const coverFile = req.files?.cover?.[0];
    if (!audioFile) return res.status(400).json({ error: 'Vui lòng upload file nhạc' });

    const song = await Song.create({
      title,
      artistId: parseInt(artistId),
      albumId:  albumId ? parseInt(albumId) : null,
      duration: parseInt(duration) || 0,
      audioUrl: audioFile.path,
      coverUrl: coverFile ? coverFile.path : null,
    });

    const full = await Song.findByPk(song.id, { include: songInclude });
    res.status(201).json({ data: full });
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
    res.json({ data: { message: 'Đã xóa bài hát' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, getTop, search, getOne, countPlay, stream, create, remove };
