const express = require('express');
const { check } = require('express-validator');
const { getCategories, getCategory, getCategoryStories, createCategory, updateCategory, deleteCategory } = require('../controllers/categories');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// @route    GET /api/categories
// @desc     Lấy tất cả thể loại
// @access   Public
router.get('/', getCategories);

// @route    GET /api/categories/:id
// @desc     Lấy một thể loại theo ID
// @access   Public
router.get('/:id', getCategory);

// @route    GET /api/categories/:id/stories
// @desc     Lấy tất cả truyện thuộc một thể loại
// @access   Public
router.get('/:id/stories', getCategoryStories);

// Tất cả các route dưới đây yêu cầu xác thực và quyền admin
router.use(protect);
router.use(authorize('admin'));

// @route    POST /api/categories
// @desc     Tạo thể loại mới
// @access   Private/Admin
router.post(
  '/',
  [
    check('name', 'Vui lòng nhập tên thể loại').not().isEmpty(),
    check('description', 'Vui lòng nhập mô tả').optional()
  ],
  createCategory
);

// @route    PUT /api/categories/:id
// @desc     Cập nhật thể loại
// @access   Private/Admin
router.put(
  '/:id',
  [
    check('name', 'Tên thể loại không được để trống').optional().not().isEmpty()
  ],
  updateCategory
);

// @route    DELETE /api/categories/:id
// @desc     Xóa thể loại
// @access   Private/Admin
router.delete('/:id', deleteCategory);

module.exports = router; 