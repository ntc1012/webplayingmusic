const { Artist, Song, Album } = require('../models');

// GET /api/artists
const getAll = async (req, res) => {
  try {
    const artists = await Artist.findAll({ order: [['name', 'ASC']] });
    res.json({ data: artists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/artists/:id
const getOne = async (req, res) => {
  try {
    const artist = await Artist.findByPk(req.params.id, {
      include: [
        {
          model: Song, as: 'songs',
          include: [{ model: Album, as: 'album', attributes: ['id', 'title', 'coverUrl'] }],
          order: [['playCount', 'DESC']],
          limit: 10,
        },
        { model: Album, as: 'albums' },
      ],
    });
    if (!artist) return res.status(404).json({ error: 'Không tìm thấy nghệ sĩ' });
    res.json({ data: artist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, getOne };
