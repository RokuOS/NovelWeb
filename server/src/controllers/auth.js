const User = require('../models/User');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

// @desc    Đăng ký người dùng
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Kiểm tra xem email đã tồn tại chưa
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Kiểm tra xem username đã tồn tại chưa
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Tên người dùng đã được sử dụng' });
    }

    // Tạo người dùng mới
    user = await User.create({
      username,
      email,
      password
    });

    // Tạo token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Đăng nhập
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    console.log('Nhận yêu cầu đăng nhập:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Lỗi validation:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log('Thông tin đăng nhập:', { email, passwordProvided: !!password });

    // Kiểm tra xem người dùng có tồn tại không
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('Không tìm thấy người dùng với email:', email);
      return res.status(401).json({ message: 'Thông tin đăng nhập không hợp lệ' });
    }
    console.log('Tìm thấy người dùng:', { id: user._id, email: user.email, role: user.role });

    // Kiểm tra xem mật khẩu có đúng không
    console.log('Đang kiểm tra mật khẩu...');
    const isMatch = await user.matchPassword(password);
    console.log('Kết quả kiểm tra mật khẩu:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Thông tin đăng nhập không hợp lệ' });
    }

    // Tạo token
    const token = user.getSignedJwtToken();
    console.log('Đăng nhập thành công, token đã được tạo');

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Lỗi xử lý đăng nhập:', err);
    next(err);
  }
};

// @desc    Lấy thông tin người dùng hiện tại
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Đổi mật khẩu
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await user.matchPassword(req.body.currentPassword);

    if (!isMatch) {
      return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    user.password = req.body.newPassword;
    await user.save();

    // Tạo token mới
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Đăng xuất / xóa cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Đăng xuất thành công'
  });
}; 