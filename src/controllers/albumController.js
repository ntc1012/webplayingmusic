const { Album, Artist, Song } = require('../models');

const songFields = { attributes: ['id', 'title', 'coverUrl', 'audioUrl', 'duration', 'playCount'] };

// GET /api/albums
const getAll = async (req, res) => {
  try {
    const albums = await Album.findAll({
      include: [{ model: Artist, as: 'artist', attributes: ['id', 'name', 'avatarUrl'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ data: albums });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/albums/:id
const getOne = async (req, res) => {
  try {
    const album = await Album.findByPk(req.params.id, {
      include: [
        { model: Artist, as: 'artist', attributes: ['id', 'name', 'avatarUrl'] },
        { model: Song,   as: 'songs',  ...songFields, order: [['playCount', 'DESC']] },
      ],
    });
    if (!album) return res.status(404).json({ error: 'Không tìm thấy album' });
    res.json({ data: album });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/albums — chỉ admin
const create = async (req, res) => {
  try {
    const { title, artistId } = req.body;
    if (!title || !artistId)
      return res.status(400).json({ error: 'Thiếu tên album hoặc nghệ sĩ' });

    const coverFile = req.file;
    const album = await Album.create({
      title,
      artistId: parseInt(artistId),
      coverUrl: coverFile ? coverFile.path.replace(/\\/g, '/') : null,
    });
    const full = await Album.findByPk(album.id, {
      include: [{ model: Artist, as: 'artist', attributes: ['id', 'name'] }],
    });
    res.status(201).json({ data: full });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/albums/:id — chỉ admin
const remove = async (req, res) => {
  try {
    const album = await Album.findByPk(req.params.id);
    if (!album) return res.status(404).json({ error: 'Không tìm thấy album' });
    await album.destroy();
    res.json({ data: { message: 'Đã xóa album' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, getOne, create, remove };
