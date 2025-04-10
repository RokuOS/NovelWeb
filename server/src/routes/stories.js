const express = require('express');
const { check } = require('express-validator');
const { 
  getStories, 
  getStory, 
  createStory, 
  updateStory, 
  deleteStory,
  getFeaturedStories,
  getTrendingStories,
  getLatestStories,
  getCompletedStories,
  migrateAuthorData,
  getStoryBySlugOrId,
  searchStories
} = require('../controllers/stories');
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Để sử dụng route lồng nhau
const router = express.Router();

// Include các route liên quan khác
const chapterRouter = require('./chapters');

// Re-route vào các router khác
router.use('/:storyId/chapters', chapterRouter);

// Rating routes
router.get('/:id/rating', protect, async (req, res) => {
  try {
    const Story = require('../models/Story');
    const userId = req.user._id;
    const storyId = req.params.id;
    
    // Tìm rating của user cho story
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy truyện'
      });
    }
    
    const userRating = story.ratings.users.find(
      rating => rating.user.toString() === userId.toString()
    );
    
    res.json({
      success: true,
      rating: userRating || null
    });
  } catch (error) {
    console.error('Get rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

router.post('/:id/rating', protect, async (req, res) => {
  try {
    const Story = require('../models/Story');
    const userId = req.user._id;
    const storyId = req.params.id;
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Đánh giá phải từ 1 đến 5'
      });
    }
    
    // Tìm story và update rating
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy truyện'
      });
    }
    
    // Kiểm tra xem user đã rating chưa
    const existingRatingIndex = story.ratings.users.findIndex(
      r => r.user.toString() === userId.toString()
    );
    
    if (existingRatingIndex > -1) {
      // Update rating cũ
      const oldRating = story.ratings.users[existingRatingIndex].value;
      story.ratings.total = story.ratings.total - oldRating + rating;
      story.ratings.users[existingRatingIndex].value = rating;
    } else {
      // Thêm rating mới
      story.ratings.users.push({
        user: userId,
        value: rating
      });
      story.ratings.total += rating;
      story.ratings.count += 1;
    }
    
    // Tính lại average
    story.ratings.average = story.ratings.total / story.ratings.count;
    
    await story.save();
    
    res.json({
      success: true,
      data: {
        ratings: story.ratings
      }
    });
  } catch (error) {
    console.error('Rate story error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route    GET /api/stories
// @desc     Lấy tất cả truyện
// @access   Public
router.get('/', getStories);

// @route    GET /api/stories/featured
// @desc     Lấy truyện nổi bật
// @access   Public
router.get('/featured', getFeaturedStories);

// @route    GET /api/stories/trending
// @desc     Lấy truyện xu hướng
// @access   Public
router.get('/trending', getTrendingStories);

// @route    GET /api/stories/latest
// @desc     Lấy truyện mới nhất
// @access   Public
router.get('/latest', getLatestStories);

// @route    GET /api/stories/completed
// @desc     Lấy truyện đã hoàn thành
// @access   Public
router.get('/completed', getCompletedStories);

// @route    GET /api/stories/search
// @desc     Tìm kiếm truyện
// @access   Public
router.get('/search', searchStories);

// @route    GET /api/stories/by-slug-or-id/:idOrSlug
// @desc     Lấy một truyện theo slug hoặc ID
// @access   Public
router.get('/by-slug-or-id/:idOrSlug', getStoryBySlugOrId);

// @route    GET /api/stories/:id
// @desc     Lấy một truyện theo ID
// @access   Public
router.get('/:id', getStory);

// Các route dưới đây yêu cầu xác thực
router.use(protect);

// @route    POST /api/stories
// @desc     Tạo truyện mới
// @access   Private
router.post(
  '/',
  upload.single('coverImage'),
  [
    check('title', 'Vui lòng nhập tiêu đề truyện').not().isEmpty(),
    check('author', 'Vui lòng nhập tên tác giả').not().isEmpty(),
    check('description', 'Vui lòng nhập mô tả').not().isEmpty(),
    check('status', 'Trạng thái không hợp lệ').optional().isIn(['ongoing', 'completed', 'dropped'])
  ],
  createStory
);

// @route    PUT /api/stories/:id
// @desc     Cập nhật truyện
// @access   Private (chỉ người tạo hoặc admin)
router.put(
  '/:id',
  upload.single('coverImage'),
  [
    check('title', 'Tiêu đề không được để trống').optional().not().isEmpty(),
    check('author', 'Tên tác giả không được để trống').optional().not().isEmpty(),
    check('status', 'Trạng thái không hợp lệ').optional().isIn(['ongoing', 'completed', 'dropped'])
  ],
  updateStory
);

// @route    DELETE /api/stories/:id
// @desc     Xóa truyện
// @access   Private (chỉ người tạo hoặc admin)
router.delete('/:id', deleteStory);

// Route để fix dữ liệu author
router.get('/migration/fix-author', protect, authorize('admin'), migrateAuthorData);

module.exports = router; 