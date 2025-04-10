const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Tải các biến môi trường từ file .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Model User (copy model hoặc import từ models)
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Vui lòng nhập tên người dùng'],
    unique: true,
    trim: true,
    maxlength: [50, 'Tên người dùng không được quá 50 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Vui lòng nhập email hợp lệ'
    ]
  },
  password: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', UserSchema);

// Kết nối đến MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB kết nối thành công: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Lỗi kết nối MongoDB:', error.message);
    process.exit(1);
  }
};

// Tạo người dùng mới
const createUser = async () => {
  const userData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    role: 'user'
  };

  try {
    // Xóa người dùng cũ nếu đã tồn tại
    await User.deleteOne({ email: userData.email });
    console.log(`Đã xóa người dùng với email ${userData.email} (nếu tồn tại)`);

    // Tạo người dùng mới
    const user = await User.create(userData);
    console.log('Người dùng đã được tạo thành công:');
    console.log({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Lỗi tạo người dùng:', error.message);
  }
};

// Chạy script
connectDB()
  .then(async () => {
    await createUser();
    console.log('Hoàn tất tạo dữ liệu người dùng');
    process.exit(0);
  })
  .catch(error => {
    console.error('Lỗi chạy script:', error);
    process.exit(1);
  }); 