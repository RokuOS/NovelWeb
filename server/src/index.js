const dotenv = require('dotenv');
const app = require('./app');
const mongoose = require('mongoose');

// Load env vars
dotenv.config();

// Kết nối với MongoDB và log thông tin
const connectDB = async () => {
  try {
    console.log('Đang kết nối đến MongoDB:', process.env.MONGO_URI);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB đã kết nối: ${conn.connection.host}`);
  } catch (error) {
    console.error('Lỗi kết nối MongoDB:', error.message);
    console.error('Chi tiết lỗi:', error);
    process.exit(1);
  }
};

// Kết nối database trước khi khởi động server
connectDB().then(() => {
  // Start server sau khi kết nối DB thành công
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server đang chạy ở port ${PORT} trong môi trường ${process.env.NODE_ENV}`);
  });
});