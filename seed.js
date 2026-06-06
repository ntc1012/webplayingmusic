require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Artist, Album, Song } = require('./src/models');

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('🌱 Bắt đầu seed...');

    // Users
    await User.findOrCreate({ where: { email: 'admin@music.com' }, defaults: { name: 'Admin', password: await bcrypt.hash('admin123', 10), role: 'admin' } });
    await User.findOrCreate({ where: { email: 'user@music.com'  }, defaults: { name: 'Người dùng mẫu', password: await bcrypt.hash('user123', 10), role: 'user' } });
    console.log('✅ Users: admin@music.com / admin123 | user@music.com / user123');

    // Artists
    const [sontung] = await Artist.findOrCreate({ where: { name: 'Sơn Tùng M-TP'  }, defaults: { avatarUrl: 'https://picsum.photos/seed/sontung/200/200', bio: 'Ca sĩ kiêm nhạc sĩ nổi tiếng' } });
    const [htl]     = await Artist.findOrCreate({ where: { name: 'Hoàng Thùy Linh' }, defaults: { avatarUrl: 'https://picsum.photos/seed/htl/200/200',    bio: 'Nữ ca sĩ đa tài' } });
    const [den]     = await Artist.findOrCreate({ where: { name: 'Đen Vâu'          }, defaults: { avatarUrl: 'https://picsum.photos/seed/den/200/200',    bio: 'Rapper hàng đầu Việt Nam' } });
    console.log('✅ Artists done');

    // Albums
    const [skytour] = await Album.findOrCreate({ where: { title: 'Sky Tour' }, defaults: { coverUrl: 'https://picsum.photos/seed/skytour/300/300', artistId: sontung.id } });
    const [link]    = await Album.findOrCreate({ where: { title: 'LINK'     }, defaults: { coverUrl: 'https://picsum.photos/seed/link/300/300',    artistId: htl.id } });

    // Songs
    const songs = [
      { title: 'Chúng Ta Của Hiện Tại', artistId: sontung.id, albumId: skytour.id, duration: 253, playCount: 1500000, coverUrl: 'https://picsum.photos/seed/s1/300/300',  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { title: 'Muộn Rồi Mà Sao Còn',   artistId: sontung.id, albumId: skytour.id, duration: 218, playCount: 2100000, coverUrl: 'https://picsum.photos/seed/s2/300/300',  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
      { title: 'Có Chắc Yêu Là Đây',    artistId: sontung.id, albumId: skytour.id, duration: 195, playCount: 1800000, coverUrl: 'https://picsum.photos/seed/s3/300/300',  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
      { title: 'Hãy Trao Cho Anh',       artistId: sontung.id, albumId: skytour.id, duration: 278, playCount: 4200000, coverUrl: 'https://picsum.photos/seed/s10/300/300', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' },
      { title: 'Kẻ Thứ Ba',             artistId: htl.id,     albumId: link.id,    duration: 225, playCount:  980000, coverUrl: 'https://picsum.photos/seed/s4/300/300',  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
      { title: 'Kém Duyên',             artistId: htl.id,     albumId: link.id,    duration: 210, playCount: 1200000, coverUrl: 'https://picsum.photos/seed/s5/300/300',  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
      { title: 'Để Mị Nói Cho Mà Nghe', artistId: htl.id,     albumId: link.id,    duration: 198, playCount: 3000000, coverUrl: 'https://picsum.photos/seed/s6/300/300',  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
      { title: 'Mang Tiền Về Cho Mẹ',   artistId: den.id,     albumId: null,       duration: 245, playCount: 5000000, coverUrl: 'https://picsum.photos/seed/s7/300/300',  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
      { title: 'Trốn Tìm',              artistId: den.id,     albumId: null,       duration: 208, playCount: 2500000, coverUrl: 'https://picsum.photos/seed/s8/300/300',  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
      { title: 'Đưa Nhau Đi Trốn',      artistId: den.id,     albumId: null,       duration: 232, playCount: 1900000, coverUrl: 'https://picsum.photos/seed/s9/300/300',  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },
    ];
    for (const s of songs) await Song.findOrCreate({ where: { title: s.title }, defaults: s });
    console.log('✅ Songs done (10 bài)');
    console.log('🎉 Seed hoàn tất! Chạy: npm run dev');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed lỗi:', err.message);
    process.exit(1);
  }
})();
