const express = require('express');
const { check } = require('express-validator');
const { register, login, getMe, updatePassword, logout } = require('../controllers/auth');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// @route    POST /api/auth/register
// @desc     Đăng ký người dùng
// @access   Public
router.post(
  '/register',
  [
    check('username', 'Vui lòng nhập tên người dùng').not().isEmpty(),
    check('email', 'Vui lòng nhập một email hợp lệ').isEmail(),
    check('password', 'Mật khẩu phải có ít nhất 6 ký tự').isLength({ min: 6 })
  ],
  register
);

// @route    POST /api/auth/login
// @desc     Đăng nhập
// @access   Public
router.post(
  '/login',
  [
    check('email', 'Vui lòng nhập một email hợp lệ').isEmail(),
    check('password', 'Mật khẩu là bắt buộc').exists()
  ],
  login
);

// @route    GET /api/auth/me
// @desc     Lấy thông tin người dùng hiện tại
// @access   Private
router.get('/me', protect, getMe);

// @route    PUT /api/auth/updatepassword
// @desc     Cập nhật mật khẩu
// @access   Private
router.put(
  '/updatepassword',
  [
    check('currentPassword', 'Vui lòng nhập mật khẩu hiện tại').not().isEmpty(),
    check('newPassword', 'Mật khẩu mới phải có ít nhất 6 ký tự').isLength({ min: 6 })
  ],
  protect,
  updatePassword
);

// @route    GET /api/auth/logout
// @desc     Đăng xuất / xóa cookie
// @access   Private
router.get('/logout', protect, logout);

module.exports = router; 