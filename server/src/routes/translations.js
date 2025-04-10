const express = require('express');
const { check } = require('express-validator');
const { getTranslations, getTranslation, createTranslation, updateTranslation, deleteTranslation, machineTranslateChapter } = require('../controllers/translations');
const { protect } = require('../middlewares/auth');

// Để sử dụng route lồng nhau
const router = express.Router({ mergeParams: true });

// @route    GET /api/chapters/:chapterId/translations
// @desc     Lấy tất cả bản dịch của một chương
// @access   Public
router.get('/', getTranslations);

// @route    GET /api/translations/:id
// @desc     Lấy một bản dịch theo ID
// @access   Public
router.get('/:id', getTranslation);

// Các route dưới đây yêu cầu xác thực
router.use(protect);

// @route    POST /api/chapters/:chapterId/translations
// @desc     Tạo bản dịch mới
// @access   Private
router.post(
  '/',
  [
    check('original_text', 'Vui lòng nhập văn bản gốc').not().isEmpty(),
    check('translated_text', 'Vui lòng nhập văn bản đã dịch').not().isEmpty(),
    check('segment_index', 'Vui lòng nhập chỉ số đoạn').isNumeric()
  ],
  createTranslation
);

// @route    PUT /api/translations/:id
// @desc     Cập nhật bản dịch
// @access   Private (chỉ người tạo hoặc admin)
router.put(
  '/:id',
  [
    check('translated_text', 'Văn bản đã dịch không được để trống').not().isEmpty()
  ],
  updateTranslation
);

// @route    DELETE /api/translations/:id
// @desc     Xóa bản dịch
// @access   Private (chỉ người tạo hoặc admin)
router.delete('/:id', deleteTranslation);

// @route    POST /api/chapters/:chapterId/machine-translate
// @desc     Dịch tự động một chương
// @access   Private (chỉ người tạo truyện, admin hoặc người có quyền đóng góp)
router.post('/machine-translate', machineTranslateChapter);

module.exports = router; 