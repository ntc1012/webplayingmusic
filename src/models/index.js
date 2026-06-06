const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// ─── USER ────────────────────────────────────────────
const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.ENUM("user", "admin"), defaultValue: "user" },
  },
  { tableName: "users", timestamps: true },
);

// ─── ARTIST ──────────────────────────────────────────
const Artist = sequelize.define(
  "Artist",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    avatarUrl: { type: DataTypes.STRING(500) },
    bio: { type: DataTypes.TEXT },
  },
  { tableName: "artists", timestamps: true },
);

// ─── ALBUM ───────────────────────────────────────────
const Album = sequelize.define(
  "Album",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    coverUrl: { type: DataTypes.STRING(500) },
    artistId: { type: DataTypes.INTEGER },
  },
  { tableName: "albums", timestamps: true },
);

// ─── SONG ────────────────────────────────────────────
const Song = sequelize.define(
  "Song",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    coverUrl: { type: DataTypes.STRING(500) },
    audioUrl: { type: DataTypes.STRING(500), allowNull: false },
    duration: { type: DataTypes.INTEGER, defaultValue: 0 },
    playCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    artistId: { type: DataTypes.INTEGER },
    albumId: { type: DataTypes.INTEGER },
  },
  { tableName: "songs", timestamps: true },
);

// ─── PLAYLIST ────────────────────────────────────────
const Playlist = sequelize.define(
  "Playlist",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
  },
  { tableName: "playlists", timestamps: true },
);

// ─── PLAYLIST_SONG ───────────────────────────────────
const PlaylistSong = sequelize.define(
  "PlaylistSong",
  {
    playlistId: { type: DataTypes.INTEGER },
    songId: { type: DataTypes.INTEGER },
  },
  { tableName: "playlist_songs", timestamps: false },
);

// ─── FAVORITE ────────────────────────────────────────
const Favorite = sequelize.define(
  "Favorite",
  {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    songId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "favorites",
    timestamps: true,
    id: false, // ← thêm dòng này
  },
);

// ─── ASSOCIATIONS ─────────────────────────────────────

// Artist <-> Song
Artist.hasMany(Song, { foreignKey: "artistId", as: "songs" });
Song.belongsTo(Artist, { foreignKey: "artistId", as: "artist" });

// Artist <-> Album
Artist.hasMany(Album, { foreignKey: "artistId", as: "albums" });
Album.belongsTo(Artist, { foreignKey: "artistId", as: "artist" });

// Album <-> Song
Album.hasMany(Song, { foreignKey: "albumId", as: "songs" });
Song.belongsTo(Album, { foreignKey: "albumId", as: "album" });

// User <-> Playlist
User.hasMany(Playlist, { foreignKey: "userId", as: "playlists" });
Playlist.belongsTo(User, { foreignKey: "userId", as: "user" });

// Playlist <-> Song (many-to-many)
Playlist.belongsToMany(Song, {
  through: PlaylistSong,
  foreignKey: "playlistId",
  as: "songs",
});
Song.belongsToMany(Playlist, {
  through: PlaylistSong,
  foreignKey: "songId",
  as: "playlists",
});

// Favorite — dùng association trực tiếp để include dễ hơn
// FIX: thêm belongsTo trực tiếp thay vì chỉ dùng many-to-many
Favorite.belongsTo(User, { foreignKey: "userId", as: "user" });
Favorite.belongsTo(Song, { foreignKey: "songId", as: "song" });
User.hasMany(Favorite, { foreignKey: "userId", as: "favorites" });
Song.hasMany(Favorite, { foreignKey: "songId", as: "favorites" });

module.exports = {
  sequelize,
  User,
  Artist,
  Album,
  Song,
  Playlist,
  PlaylistSong,
  Favorite,
};
