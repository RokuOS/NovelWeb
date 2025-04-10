const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware để bảo vệ các route yêu cầu xác thực
exports.protect = async (req, res, next) => {
  let token;

  // Kiểm tra authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Format: Bearer token
    token = req.headers.authorization.split(' ')[1];
  }

  // Kiểm tra xem token có tồn tại không
  if (!token) {
    return res.status(401).json({
      message: 'Không có quyền truy cập. Vui lòng đăng nhập.'
    });
  }

  try {
    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Thêm thông tin người dùng vào request
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Không có quyền truy cập. Vui lòng đăng nhập lại.'
    });
  }
};

// Giới hạn quyền truy cập dựa trên vai trò
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Không có quyền truy cập. Vui lòng đăng nhập.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Vai trò '${req.user.role}' không có quyền truy cập vào tính năng này.`
      });
    }
    
    next();
  };
};

exports.isAdmin = async (req, res, next) => {
  try {
    // Kiểm tra token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Kiểm tra user có tồn tại và là admin không
    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập trang này'
      });
    }

    // Lưu thông tin user vào request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn'
    });
  }
}; 