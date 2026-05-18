const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ─── USER ───────────────────────────────────────────
const User = sequelize.define('User', {
  id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:     { type: DataTypes.STRING(100), allowNull: false },
  email:    { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role:     { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
}, { tableName: 'users', timestamps: true });

// ─── ARTIST ─────────────────────────────────────────
const Artist = sequelize.define('Artist', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:      { type: DataTypes.STRING(150), allowNull: false },
  avatarUrl: { type: DataTypes.STRING(500) },
  bio:       { type: DataTypes.TEXT },
}, { tableName: 'artists', timestamps: true });

// ─── ALBUM ──────────────────────────────────────────
const Album = sequelize.define('Album', {
  id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title:    { type: DataTypes.STRING(200), allowNull: false },
  coverUrl: { type: DataTypes.STRING(500) },
  artistId: { type: DataTypes.INTEGER },
}, { tableName: 'albums', timestamps: true });

// ─── SONG ───────────────────────────────────────────
const Song = sequelize.define('Song', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title:     { type: DataTypes.STRING(200), allowNull: false },
  coverUrl:  { type: DataTypes.STRING(500) },
  audioUrl:  { type: DataTypes.STRING(500), allowNull: false },
  duration:  { type: DataTypes.INTEGER, defaultValue: 0 }, // giây
  playCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  artistId:  { type: DataTypes.INTEGER },
  albumId:   { type: DataTypes.INTEGER },
}, { tableName: 'songs', timestamps: true });

// ─── PLAYLIST ────────────────────────────────────────
const Playlist = sequelize.define('Playlist', {
  id:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:   { type: DataTypes.STRING(150), allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'playlists', timestamps: true });

// ─── PLAYLIST_SONG (many-to-many) ────────────────────
const PlaylistSong = sequelize.define('PlaylistSong', {
  playlistId: { type: DataTypes.INTEGER },
  songId:     { type: DataTypes.INTEGER },
}, { tableName: 'playlist_songs', timestamps: false });

// ─── FAVORITE ────────────────────────────────────────
const Favorite = sequelize.define('Favorite', {
  userId: { type: DataTypes.INTEGER },
  songId: { type: DataTypes.INTEGER },
}, { tableName: 'favorites', timestamps: true });

// ─── ASSOCIATIONS ─────────────────────────────────────
Artist.hasMany(Song,   { foreignKey: 'artistId', as: 'songs' });
Song.belongsTo(Artist, { foreignKey: 'artistId', as: 'artist' });

Artist.hasMany(Album,  { foreignKey: 'artistId', as: 'albums' });
Album.belongsTo(Artist,{ foreignKey: 'artistId', as: 'artist' });

Album.hasMany(Song,    { foreignKey: 'albumId',  as: 'songs' });
Song.belongsTo(Album,  { foreignKey: 'albumId',  as: 'album' });

User.hasMany(Playlist, { foreignKey: 'userId', as: 'playlists' });
Playlist.belongsTo(User,{ foreignKey: 'userId', as: 'user' });

Playlist.belongsToMany(Song, { through: PlaylistSong, foreignKey: 'playlistId', as: 'songs' });
Song.belongsToMany(Playlist, { through: PlaylistSong, foreignKey: 'songId',     as: 'playlists' });

User.belongsToMany(Song, { through: Favorite, foreignKey: 'userId', as: 'favoriteSongs' });
Song.belongsToMany(User, { through: Favorite, foreignKey: 'songId', as: 'favoritedBy' });

module.exports = { sequelize, User, Artist, Album, Song, Playlist, PlaylistSong, Favorite };
