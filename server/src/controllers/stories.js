const Story = require('../models/Story');
const Category = require('../models/Category');
const StoryCategory = require('../models/StoryCategory');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// @desc    Lấy tất cả truyện
// @route   GET /api/stories
// @access  Public
exports.getStories = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Story.countDocuments();

    // Filter
    let query = {};
    
    // Filter by status
    if (req.query.status && ['ongoing', 'completed', 'dropped'].includes(req.query.status)) {
      query.status = req.query.status;
    }
    
    // Filter by title
    if (req.query.title) {
      query.title = { $regex: req.query.title, $options: 'i' };
    }
    
    // Filter by author
    if (req.query.author) {
      query.author = req.query.author;
    }

    // Sorting
    let sort = {};
    if (req.query.sort) {
      const sortField = req.query.sort.startsWith('-') ? req.query.sort.substring(1) : req.query.sort;
      const sortOrder = req.query.sort.startsWith('-') ? -1 : 1;
      sort[sortField] = sortOrder;
    } else {
      sort = { createdAt: -1 };
    }

    const stories = await Story.find(query)
      .sort(sort)
      .skip(startIndex)
      .limit(limit)
      .populate('author', 'username');

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: stories.length,
      pagination,
      total,
      data: stories
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Lấy truyện nổi bật
// @route   GET /api/stories/featured
// @access  Public
exports.getFeaturedStories = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    
    // Lấy truyện có lượt xem cao
    const stories = await Story.find()
      .sort({ views: -1, rating: -1 })
      .limit(limit)
      .populate('author', 'username');

    res.status(200).json({
      success: true,
      count: stories.length,
      data: stories
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Lấy truyện xu hướng
// @route   GET /api/stories/trending
// @access  Public
exports.getTrendingStories = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    
    // Lấy truyện mới cập nhật và có lượt xem cao
    const stories = await Story.find()
      .sort({ updatedAt: -1, views: -1 })
      .limit(limit)
      .populate('author', 'username');

    res.status(200).json({
      success: true,
      count: stories.length,
      data: stories
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Lấy truyện mới nhất
// @route   GET /api/stories/latest
// @access  Public
exports.getLatestStories = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    
    // Lấy truyện mới thêm gần đây
    const stories = await Story.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('author', 'username');

    res.status(200).json({
      success: true,
      count: stories.length,
      data: stories
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Lấy truyện đã hoàn thành
// @route   GET /api/stories/completed
// @access  Public
exports.getCompletedStories = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    
    // Lấy truyện có trạng thái đã hoàn thành
    const stories = await Story.find({ status: 'completed' })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate('author', 'username');

    res.status(200).json({
      success: true,
      count: stories.length,
      data: stories
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Lấy một truyện theo slug hoặc ID
// @route   GET /api/stories/by-slug-or-id/:idOrSlug
// @access  Public
exports.getStoryBySlugOrId = async (req, res, next) => {
  try {
    const idOrSlug = req.params.idOrSlug;
    
    // Kiểm tra tham số có được cung cấp không
    if (!idOrSlug) {
      console.log('ID hoặc slug trống');
      return res.status(400).json({ 
        success: false,
        message: 'ID hoặc slug truyện không được cung cấp' 
      });
    }

    console.log(`Đang tìm truyện với idOrSlug: "${idOrSlug}"`);
    
    let story;
    
    // Kiểm tra xem có phải ObjectId không
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      console.log(`"${idOrSlug}" có định dạng ObjectId hợp lệ, tìm theo ID`);
      // Nếu là ID hợp lệ, tìm theo ID
      story = await Story.findById(idOrSlug)
        .populate('author', 'username')
        .populate({
          path: 'chapters',
          options: { sort: { chapter_number: 1 } }
        });
    } else {
      console.log(`"${idOrSlug}" không phải ObjectId, tìm theo slug hoặc title`);
      
      // Tạo regex để tìm kiếm không phân biệt hoa thường và dấu
      const titleRegex = new RegExp(idOrSlug.replace(/-/g, '[-\\s]'), 'i');
      
      // Nếu không phải ID, tìm theo slug, title hoặc một phần của title
      story = await Story.findOne({ 
        $or: [
          { slug: idOrSlug },
          { title: { $regex: titleRegex } },
          { title: idOrSlug } // Tìm kiếm chính xác
        ]
      })
      .populate('author', 'username')
      .populate({
        path: 'chapters',
        options: { sort: { chapter_number: 1 } }
      });
      
      if (!story) {
        // Thử tìm với slug được tạo từ idOrSlug
        const generatedSlug = idOrSlug
          .toLowerCase()
          .replace(/[^\w\sÀ-ÿ]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
          
        console.log(`Không tìm thấy, thử tìm với slug được tạo: "${generatedSlug}"`);
        
        story = await Story.findOne({
          title: { $regex: new RegExp(generatedSlug.replace(/-/g, '\\s'), 'i') }
        })
        .populate('author', 'username')
        .populate({
          path: 'chapters',
          options: { sort: { chapter_number: 1 } }
        });
      }
    }

    if (!story) {
      console.log(`Không tìm thấy truyện với ID hoặc slug: ${idOrSlug}`);
      // Lấy danh sách truyện có title gần giống
      const similarStories = await Story.find({
        title: { $regex: new RegExp(idOrSlug, 'i') }
      })
      .select('title slug')
      .limit(5);
      
      console.log('Các truyện có tên tương tự:', similarStories.map(s => s.title));
      
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy truyện',
        similarStories: similarStories.length > 0 ? similarStories : undefined
      });
    }

    console.log(`Đã tìm thấy truyện: ${story.title} (ID: ${story._id})`);

    // Cập nhật lượt xem
    if (!req.query.noview) {
      story.views += 1;
      await story.save();
    }

    // Lấy các thể loại của truyện
    const storyCategories = await StoryCategory.find({ story: story._id }).populate('category');
    const categories = storyCategories.map(sc => sc.category);

    res.status(200).json({
      success: true,
      data: {
        ...story._doc,
        categories
      }
    });
  } catch (err) {
    console.error(`Error fetching story by slug or ID: ${err.message}`, err);
    next(err);
  }
};

// @desc    Lấy một truyện theo ID
// @route   GET /api/stories/:id
// @access  Public
exports.getStory = async (req, res, next) => {
  try {
    // Kiểm tra ID có hợp lệ không trước khi tìm kiếm
    if (!req.params.id) {
      console.log('ID trống hoặc null');
      return res.status(400).json({ 
        success: false,
        message: 'ID truyện không được cung cấp' 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log(`ID không hợp lệ: ${req.params.id}`);
      return res.status(400).json({ 
        success: false,
        message: 'ID truyện không hợp lệ',
        detail: `Giá trị '${req.params.id}' không phải là MongoDB ObjectId hợp lệ`
      });
    }

    const story = await Story.findById(req.params.id)
      .populate('author', 'username')
      .populate({
        path: 'chapters',
        options: { sort: { chapter_number: 1 } }
      });

    if (!story) {
      console.log(`Không tìm thấy truyện với ID: ${req.params.id}`);
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy truyện' 
      });
    }

    // Cập nhật lượt xem
    if (!req.query.noview) {
      story.views += 1;
      await story.save();
    }

    // Lấy các thể loại của truyện
    const storyCategories = await StoryCategory.find({ story: story._id }).populate('category');
    const categories = storyCategories.map(sc => sc.category);

    res.status(200).json({
      success: true,
      data: {
        ...story._doc,
        categories
      }
    });
  } catch (err) {
    console.error(`Error fetching story: ${err.message}`, err);
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: 'ID truyện không hợp lệ' 
      });
    }
    next(err);
  }
};

// @desc    Tạo truyện mới
// @route   POST /api/stories
// @access  Private
exports.createStory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, status, categories } = req.body;
    let coverImage = 'default-cover.jpg';

    // Xử lý ảnh bìa nếu có
    if (req.file) {
      coverImage = req.file.filename;
    }

    // Xử lý categories nếu có
    let categoryIds = [];
    if (categories) {
      try {
        categoryIds = JSON.parse(categories);
      } catch (err) {
        console.error('Error parsing categories:', err);
      }
    }

    const story = await Story.create({
      title,
      author: req.user.id,
      description,
      coverImage,
      status,
      categories: categoryIds
    });

    // Thêm các thể loại nếu có
    if (categoryIds && categoryIds.length > 0) {
      const categoryPromises = categoryIds.map(async categoryId => {
        // Kiểm tra xem category có tồn tại không
        const categoryExists = await Category.findById(categoryId);
        if (categoryExists) {
          return StoryCategory.create({
            story: story._id,
            category: categoryId
          });
        }
        return null;
      });
      
      await Promise.all(categoryPromises);
    }

    res.status(201).json({
      success: true,
      data: story
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cập nhật truyện
// @route   PUT /api/stories/:id
// @access  Private
exports.updateStory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Không tìm thấy truyện' });
    }

    // Kiểm tra quyền: chỉ author hoặc admin mới có thể cập nhật
    if (story.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật truyện này' });
    }

    const { title, description, coverImage, status, categories } = req.body;
    
    const updateData = {
      title,
      description,
      coverImage,
      status
    };

    // Loại bỏ các trường không được cung cấp
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    // Cập nhật truyện
    story = await Story.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    // Cập nhật các thể loại
    if (categories) {
      try {
        // Parse categories nếu cần
        let categoryArray = [];
        
        if (typeof categories === 'string') {
          try {
            const parsed = JSON.parse(categories);
            if (Array.isArray(parsed)) {
              categoryArray = parsed;
            } else {
              console.error('Categories sau khi parse không phải mảng:', parsed);
            }
          } catch (e) {
            console.error('Error parsing categories JSON:', e);
          }
        } else if (Array.isArray(categories)) {
          categoryArray = categories;
        }
        
        console.log('Categories sau khi xử lý:', categoryArray);
        
        // Xóa tất cả các thể loại cũ
        await StoryCategory.deleteMany({ story: story._id });
        
        // Thêm các thể loại mới nếu có
        if (categoryArray.length > 0) {
          const categoryPromises = categoryArray.map(async categoryId => {
            if (!categoryId) return null;
            
            try {
              // Kiểm tra xem category có tồn tại không
              const categoryExists = await Category.findById(categoryId);
              if (categoryExists) {
                return StoryCategory.create({
                  story: story._id,
                  category: categoryId
                });
              }
            } catch (err) {
              console.error(`Error adding category ${categoryId}:`, err);
            }
            return null;
          });
          
          await Promise.all(categoryPromises);
        }
      } catch (error) {
        console.error('Error handling categories:', error);
      }
    }

    res.status(200).json({
      success: true,
      data: story
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Xóa truyện
// @route   DELETE /api/stories/:id
// @access  Private
exports.deleteStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Không tìm thấy truyện' });
    }

    // Kiểm tra quyền: chỉ author hoặc admin mới có thể xóa
    if (story.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền xóa truyện này' });
    }

    // Xóa các liên kết với thể loại
    await StoryCategory.deleteMany({ story: story._id });

    // Gọi remove() để kích hoạt middleware xóa các chương
    await story.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// Thêm fix migration cho các truyện có author là string
exports.migrateAuthorData = async (req, res, next) => {
  try {
    // Tìm tất cả các truyện có author là string
    const stories = await Story.find({});
    let fixedCount = 0;
    
    for (const story of stories) {
      try {
        // Nếu author là string, gán về admin user
        if (typeof story.author === 'string' || !(story.author instanceof mongoose.Types.ObjectId)) {
          story.author = req.user._id; // Gán về user hiện tại
          await story.save();
          fixedCount++;
        }
      } catch (storyErr) {
        console.error(`Error migrating story ${story._id}:`, storyErr);
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Đã sửa ${fixedCount} truyện có lỗi author`,
      fixedCount
    });
  } catch (err) {
    console.error('Migration error:', err);
    next(err);
  }
};

// @desc    Tìm kiếm truyện
// @route   GET /api/stories/search
// @access  Public
exports.searchStories = async (req, res, next) => {
  try {
    const searchQuery = req.query.q;
    
    if (!searchQuery) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Tạo các điều kiện tìm kiếm
    const searchRegex = new RegExp(searchQuery, 'i');
    const searchConditions = {
      $or: [
        { title: searchRegex },
        { description: searchRegex }
      ]
    };
    
    // Tìm kiếm và đếm tổng số kết quả
    const total = await Story.countDocuments(searchConditions);
    
    // Thực hiện tìm kiếm với phân trang
    const stories = await Story.find(searchConditions)
      .sort({ views: -1, updatedAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('author', 'username');
    
    // Tính toán số trang
    const totalPages = Math.ceil(total / limit);
    
    // Kết quả phân trang
    const pagination = {
      currentPage: page,
      totalPages,
      totalResults: total
    };
    
    res.status(200).json({
      success: true,
      count: stories.length,
      pagination,
      data: stories
    });
  } catch (err) {
    console.error('Search error:', err);
    next(err);
  }
}; 