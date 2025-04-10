const express = require('express');
const { check } = require('express-validator');
const { getChapters, getChapter, createChapter, updateChapter, deleteChapter } = require('../controllers/chapters');
const { protect } = require('../middlewares/auth');
const Chapter = require('../models/Chapter');

// Để sử dụng route lồng nhau
const router = express.Router({ mergeParams: true });

// Include các route liên quan khác
const translationRouter = require('./translations');

// Re-route vào các router khác
router.use('/:chapterId/translations', translationRouter);

// @route    GET /api/stories/:storyId/chapters
// @desc     Lấy tất cả chương của một truyện
// @access   Public
router.get('/', getChapters);

// @route    GET /api/chapters/:id
// @desc     Lấy một chương theo ID
// @access   Public
router.get('/:id', getChapter);

// @route    GET /api/stories/:storyId/chapters/navigation/:chapterId
// @desc     Lấy chương trước và sau của một chương
// @access   Public
router.get('/navigation/:chapterId', async (req, res, next) => {
  try {
    const { storyId, chapterId } = req.params;
    
    // Tìm chương hiện tại để lấy số chương
    const currentChapter = await Chapter.findById(chapterId);
    
    if (!currentChapter) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy chương' 
      });
    }
    
    // Lấy chương trước
    const prevChapter = await Chapter.findOne({
      story: storyId,
      chapter_number: { $lt: currentChapter.chapter_number }
    }).sort({ chapter_number: -1 }).select('_id chapter_number title');
    
    // Lấy chương sau
    const nextChapter = await Chapter.findOne({
      story: storyId,
      chapter_number: { $gt: currentChapter.chapter_number }
    }).sort({ chapter_number: 1 }).select('_id chapter_number title');
    
    res.status(200).json({
      success: true,
      prev: prevChapter,
      next: nextChapter
    });
  } catch (err) {
    next(err);
  }
});

// Các route dưới đây yêu cầu xác thực
router.use(protect);

// @route    POST /api/stories/:storyId/chapters
// @desc     Tạo chương mới
// @access   Private (chỉ người tạo truyện hoặc admin)
router.post(
  '/',
  [
    check('title', 'Vui lòng nhập tiêu đề chương').not().isEmpty(),
    check('content', 'Vui lòng nhập nội dung chương').not().isEmpty(),
    check('chapter_number', 'Vui lòng nhập số chương hợp lệ').isNumeric()
  ],
  createChapter
);

// @route    PUT /api/chapters/:id
// @desc     Cập nhật chương
// @access   Private (chỉ người tạo truyện hoặc admin)
router.put(
  '/:id',
  [
    check('title', 'Tiêu đề không được để trống').optional().not().isEmpty(),
    check('content', 'Nội dung không được để trống').optional().not().isEmpty(),
    check('chapter_number', 'Số chương phải là số').optional().isNumeric()
  ],
  updateChapter
);

// @route    DELETE /api/chapters/:id
// @desc     Xóa chương
// @access   Private (chỉ người tạo truyện hoặc admin)
router.delete('/:id', deleteChapter);

module.exports = router; 