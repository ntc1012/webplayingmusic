const router = require('express').Router();
const upload = require('../middlewares/upload');
const { auth, adminOnly } = require('../middlewares/auth');

const authCtrl   = require('../controllers/authController');
const songCtrl   = require('../controllers/songController');
const artistCtrl = require('../controllers/artistController');
const albumCtrl  = require('../controllers/albumController');
const userCtrl   = require('../controllers/userController');

// ─── AUTH ─────────────────────────────────────────────────────────
router.post('/auth/register', authCtrl.register);
router.post('/auth/login',    authCtrl.login);
router.get ('/auth/me',       auth, authCtrl.me);

// ─── SONGS ────────────────────────────────────────────────────────
// /top và /search đặt TRƯỚC /:id — tránh Express nhầm "top" là id
router.get   ('/songs/top',        songCtrl.getTop);
router.get   ('/songs/search',     songCtrl.search);
router.get   ('/songs',            songCtrl.getAll);
router.get   ('/songs/:id',        songCtrl.getOne);
router.get   ('/songs/:id/stream', songCtrl.stream);
router.patch ('/songs/:id/play',   songCtrl.countPlay);              // public — ai cũng tăng được

// Admin only
router.post  ('/songs', auth, adminOnly,
  upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]),
  songCtrl.create
);
router.put   ('/songs/:id', auth, adminOnly,
  upload.fields([{ name: 'cover', maxCount: 1 }]),
  songCtrl.update
);
router.delete('/songs/:id', auth, adminOnly, songCtrl.remove);

// ─── ARTISTS ──────────────────────────────────────────────────────
router.get('/artists',     artistCtrl.getAll);
router.get('/artists/:id', artistCtrl.getOne);

// ─── ALBUMS ───────────────────────────────────────────────────────
router.get   ('/albums',     albumCtrl.getAll);
router.get   ('/albums/:id', albumCtrl.getOne);
router.post  ('/albums', auth, adminOnly,
  upload.single('cover'),
  albumCtrl.create
);
router.delete('/albums/:id', auth, adminOnly, albumCtrl.remove);

// ─── FAVORITES (cần login) ────────────────────────────────────────
router.get   ('/favorites',               auth, userCtrl.getFavorites);
router.get   ('/favorites/:songId/check', auth, userCtrl.checkFavorite);
router.post  ('/favorites/:songId',       auth, userCtrl.addFavorite);
router.delete('/favorites/:songId',       auth, userCtrl.removeFavorite);

// ─── PLAYLISTS (cần login) ────────────────────────────────────────
router.get   ('/playlists',                   auth, userCtrl.getPlaylists);
router.post  ('/playlists',                   auth, userCtrl.createPlaylist);
router.put   ('/playlists/:id',               auth, userCtrl.updatePlaylist);
router.delete('/playlists/:id',               auth, userCtrl.deletePlaylist);
router.post  ('/playlists/:id/songs',         auth, userCtrl.addSongToPlaylist);
router.delete('/playlists/:id/songs/:songId', auth, userCtrl.removeSongFromPlaylist);

module.exports = router;
