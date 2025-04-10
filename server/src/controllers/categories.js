const Category = require('../models/Category');
const StoryCategory = require('../models/StoryCategory');
const { validationResult } = require('express-validator');

// @desc    Lấy tất cả thể loại
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Lấy một thể loại theo ID
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy thể loại' });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Lấy tất cả truyện theo thể loại
// @route   GET /api/categories/:id/stories
// @access  Public
exports.getCategoryStories = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy thể loại' });
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Tìm tất cả các truyện thuộc thể loại này
    const storyCategories = await StoryCategory.find({ category: req.params.id })
      .skip(startIndex)
      .limit(limit)
      .populate({
        path: 'story',
        populate: {
          path: 'createdBy',
          select: 'username'
        }
      });

    const total = await StoryCategory.countDocuments({ category: req.params.id });

    // Lấy chỉ thông tin truyện từ kết quả
    const stories = storyCategories.map(sc => sc.story);

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

// @desc    Tạo thể loại mới
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    // Kiểm tra xem thể loại đã tồn tại chưa
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Thể loại này đã tồn tại' });
    }

    const category = await Category.create({
      name,
      description
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cập nhật thể loại
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    // Kiểm tra xem thể loại đã tồn tại chưa nếu thay đổi tên
    if (name) {
      const existingCategory = await Category.findOne({ 
        name, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingCategory) {
        return res.status(400).json({ message: 'Thể loại này đã tồn tại' });
      }
    }

    const updateData = { name, description };

    // Loại bỏ các trường không được cung cấp
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy thể loại' });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Xóa thể loại
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy thể loại' });
    }

    // Xóa tất cả các liên kết với truyện
    await StoryCategory.deleteMany({ category: req.params.id });

    await category.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
}; 