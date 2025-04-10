const express = require('express');
const { check } = require('express-validator');
const { getUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/users');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Tất cả các route bên dưới đều yêu cầu xác thực
router.use(protect);

// User bookmark routes
router.get('/bookmarks', async (req, res) => {
  try {
    const user = await req.user.populate({
      path: 'bookmarks',
      populate: {
        path: 'story',
        select: 'title description coverImage slug'
      }
    });
    
    // Đảm bảo dữ liệu trả về có định dạng nhất quán
    const bookmarks = user.bookmarks || [];
    
    res.json({
      success: true,
      count: bookmarks.length,
      data: bookmarks
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách bookmark',
      data: []
    });
  }
});

router.get('/bookmarks/check/:storyId', async (req, res) => {
  try {
    const { storyId } = req.params;
    const user = await req.user.populate('bookmarks');
    const isBookmarked = user.bookmarks.some(bookmark => 
      bookmark.story.toString() === storyId
    );
    
    res.json({
      success: true,
      isBookmarked
    });
  } catch (error) {
    console.error('Check bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể kiểm tra bookmark'
    });
  }
});

router.post('/bookmarks/:storyId', async (req, res) => {
  try {
    const { storyId } = req.params;
    const user = await req.user.populate('bookmarks');
    
    // Kiểm tra xem truyện đã được bookmark chưa
    const alreadyBookmarked = user.bookmarks.some(bookmark => 
      bookmark.story.toString() === storyId
    );
    
    if (alreadyBookmarked) {
      return res.status(400).json({
        success: false,
        message: 'Truyện đã được đánh dấu'
      });
    }
    
    // Thêm bookmark mới
    const bookmark = {
      story: storyId,
      addedAt: new Date()
    };
    
    user.bookmarks.push(bookmark);
    await user.save();
    
    res.json({
      success: true,
      message: 'Đã thêm vào danh sách đánh dấu'
    });
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể thêm bookmark'
    });
  }
});

router.delete('/bookmarks/:storyId', async (req, res) => {
  try {
    const { storyId } = req.params;
    
    // Remove bookmark
    req.user.bookmarks = req.user.bookmarks.filter(
      bookmark => bookmark.story.toString() !== storyId
    );
    
    await req.user.save();
    
    res.json({
      success: true,
      message: 'Đã xóa khỏi danh sách đánh dấu'
    });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể xóa bookmark'
    });
  }
});

// Admin routes
router.use(authorize('admin'));

// @route    GET /api/users
// @desc     Lấy tất cả người dùng
// @access   Private/Admin
router.get('/', getUsers);

// @route    GET /api/users/:id
// @desc     Lấy người dùng theo ID
// @access   Private/Admin
router.get('/:id', getUser);

// @route    POST /api/users
// @desc     Tạo người dùng mới
// @access   Private/Admin
router.post(
  '/',
  [
    check('username', 'Vui lòng nhập tên người dùng').not().isEmpty(),
    check('email', 'Vui lòng nhập một email hợp lệ').isEmail(),
    check('password', 'Mật khẩu phải có ít nhất 6 ký tự').isLength({ min: 6 }),
    check('role', 'Vai trò không hợp lệ').isIn(['user', 'admin'])
  ],
  createUser
);

// @route    PUT /api/users/:id
// @desc     Cập nhật người dùng
// @access   Private/Admin
router.put(
  '/:id',
  [
    check('username', 'Tên người dùng không được để trống').optional().not().isEmpty(),
    check('email', 'Email phải hợp lệ').optional().isEmail(),
    check('role', 'Vai trò không hợp lệ').optional().isIn(['user', 'admin'])
  ],
  updateUser
);

// @route    DELETE /api/users/:id
// @desc     Xóa người dùng
// @access   Private/Admin
router.delete('/:id', deleteUser);

module.exports = router; 