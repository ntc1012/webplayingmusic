const router  = require('express').Router();
const upload  = require('../middlewares/upload');
const { auth } = require('../middlewares/auth');

const authCtrl    = require('../controllers/authController');
const songCtrl    = require('../controllers/songController');
const artistCtrl  = require('../controllers/artistController');
const userCtrl    = require('../controllers/userController');

// ─── AUTH ───────────────────────────────────────
router.post('/auth/register', authCtrl.register);
router.post('/auth/login',    authCtrl.login);
router.get ('/auth/me',       auth, authCtrl.me);

// ─── SONGS ──────────────────────────────────────
router.get   ('/songs',           songCtrl.getAll);
router.get   ('/songs/top',       songCtrl.getTop);
router.get   ('/songs/search',    songCtrl.search);
router.get   ('/songs/:id',       songCtrl.getOne);
router.get   ('/songs/:id/stream',songCtrl.stream);
router.patch ('/songs/:id/play',  songCtrl.countPlay);
router.post  ('/songs',           auth,
  upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]),
  songCtrl.create
);
router.delete('/songs/:id',       auth, songCtrl.remove);

// ─── ARTISTS ────────────────────────────────────
router.get('/artists',    artistCtrl.getAll);
router.get('/artists/:id',artistCtrl.getOne);

// ─── FAVORITES (cần login) ───────────────────────
router.get   ('/favorites',         auth, userCtrl.getFavorites);
router.post  ('/favorites/:songId', auth, userCtrl.addFavorite);
router.delete('/favorites/:songId', auth, userCtrl.removeFavorite);

// ─── PLAYLISTS (cần login) ───────────────────────
router.get   ('/playlists',                         auth, userCtrl.getPlaylists);
router.post  ('/playlists',                         auth, userCtrl.createPlaylist);
router.delete('/playlists/:id',                     auth, userCtrl.deletePlaylist);
router.post  ('/playlists/:id/songs',               auth, userCtrl.addSongToPlaylist);
router.delete('/playlists/:id/songs/:songId',       auth, userCtrl.removeSongFromPlaylist);

module.exports = router;
