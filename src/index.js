require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { sequelize } = require("./models");

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api", require("./routes"));

// 404
app.use((req, res) => {
  res
    .status(404)
    .json({ error: `Không tìm thấy route ${req.method} ${req.path}` });
});

// Global error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Lỗi server" });
});

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Kết nối database thành công");
    await sequelize.sync();
    console.log("✅ Đồng bộ database thành công");
    app.listen(PORT, () => {
      console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
      console.log(`📦 API tại http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error("❌ Lỗi khởi động:", err.message);
    process.exit(1);
  }
})();
