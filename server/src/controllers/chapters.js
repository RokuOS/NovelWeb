const Chapter = require('../models/Chapter');
const Story = require('../models/Story');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// @desc    Lấy tất cả chương của một truyện
// @route   GET /api/stories/:storyId/chapters
// @access  Public
exports.getChapters = async (req, res, next) => {
  try {
    const storyIdOrSlug = req.params.storyId;
    console.log(`Đang lấy danh sách chương của truyện với ID hoặc slug: "${storyIdOrSlug}"`);
    
    let story;
    
    // Kiểm tra xem có phải ObjectId không
    if (mongoose.Types.ObjectId.isValid(storyIdOrSlug)) {
      console.log(`"${storyIdOrSlug}" có định dạng ObjectId hợp lệ, tìm truyện theo ID`);
      // Nếu là ID hợp lệ, tìm theo ID
      story = await Story.findById(storyIdOrSlug);
    } else {
      console.log(`"${storyIdOrSlug}" không phải ObjectId, tìm truyện theo slug hoặc title`);
      // Nếu không phải ID, tìm theo slug (hoặc title)
      story = await Story.findOne({ 
        $or: [
          { slug: storyIdOrSlug },
          { title: { $regex: new RegExp(storyIdOrSlug.replace(/-/g, '[-\\s]'), 'i') } }
        ]
      });
    }

    if (!story) {
      console.log(`Không tìm thấy truyện với ID hoặc slug: "${storyIdOrSlug}"`);
      return res.status(404).json({ message: 'Không tìm thấy truyện' });
    }
    
    console.log(`Đã tìm thấy truyện: "${story.title}" (ID: ${story._id}), đang lấy danh sách chương`);

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Chapter.countDocuments({ story: story._id });

    // Query
    const query = { story: story._id };
    
    // Sorting
    const sort = { chapter_number: 1 }; // Mặc định sắp xếp theo số chương

    const chapters = await Chapter.find(query)
      .sort(sort)
      .skip(startIndex)
      .limit(limit)
      .populate('createdBy', 'username');

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
      count: chapters.length,
      pagination,
      total,
      data: chapters
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Lấy một chương theo ID
// @route   GET /api/chapters/:id
// @access  Public
exports.getChapter = async (req, res, next) => {
  try {
    const chapter = await Chapter.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('story', 'title author');

    if (!chapter) {
      return res.status(404).json({ message: 'Không tìm thấy chương' });
    }

    // Cập nhật lượt xem
    if (!req.query.noview) {
      chapter.views += 1;
      await chapter.save();
    }

    // Lấy chương trước và chương sau
    const prevChapter = await Chapter.findOne({
      story: chapter.story._id,
      chapter_number: { $lt: chapter.chapter_number }
    }).sort({ chapter_number: -1 }).select('_id chapter_number title');

    const nextChapter = await Chapter.findOne({
      story: chapter.story._id,
      chapter_number: { $gt: chapter.chapter_number }
    }).sort({ chapter_number: 1 }).select('_id chapter_number title');

    res.status(200).json({
      success: true,
      data: {
        ...chapter._doc,
        prevChapter,
        nextChapter
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Tạo chương mới
// @route   POST /api/stories/:storyId/chapters
// @access  Private
exports.createChapter = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const storyIdOrSlug = req.params.storyId;
    console.log(`Đang tạo chương mới cho truyện với ID hoặc slug: "${storyIdOrSlug}"`);
    
    let story;
    
    // Kiểm tra xem có phải ObjectId không
    if (mongoose.Types.ObjectId.isValid(storyIdOrSlug)) {
      console.log(`"${storyIdOrSlug}" có định dạng ObjectId hợp lệ, tìm truyện theo ID`);
      // Nếu là ID hợp lệ, tìm theo ID
      story = await Story.findById(storyIdOrSlug);
    } else {
      console.log(`"${storyIdOrSlug}" không phải ObjectId, tìm truyện theo slug hoặc title`);
      // Nếu không phải ID, tìm theo slug (hoặc title)
      story = await Story.findOne({ 
        $or: [
          { slug: storyIdOrSlug },
          { title: { $regex: new RegExp(storyIdOrSlug.replace(/-/g, '[-\\s]'), 'i') } }
        ]
      });
    }

    // Kiểm tra xem truyện có tồn tại không
    if (!story) {
      console.log(`Không tìm thấy truyện với ID hoặc slug: "${storyIdOrSlug}"`);
      return res.status(404).json({ message: 'Không tìm thấy truyện' });
    }
    
    console.log(`Đã tìm thấy truyện: "${story.title}" (ID: ${story._id}), đang tạo chương mới`);

    // Kiểm tra quyền: chỉ người tạo truyện hoặc admin mới có thể thêm chương
    if (story.author && story.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền thêm chương cho truyện này' });
    }

    const { title, content, chapter_number } = req.body;

    // Kiểm tra xem số chương đã tồn tại chưa
    const existingChapter = await Chapter.findOne({
      story: story._id,
      chapter_number
    });

    if (existingChapter) {
      return res.status(400).json({ message: 'Số chương này đã tồn tại' });
    }

    // Tạo chương mới
    const chapter = await Chapter.create({
      title,
      content,
      chapter_number,
      story: story._id,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: chapter
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cập nhật chương
// @route   PUT /api/chapters/:id
// @access  Private
exports.updateChapter = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let chapter = await Chapter.findById(req.params.id);

    if (!chapter) {
      return res.status(404).json({ message: 'Không tìm thấy chương' });
    }

    // Lấy thông tin truyện
    const story = await Story.findById(chapter.story);

    // Kiểm tra quyền: chỉ người tạo truyện hoặc admin mới có thể cập nhật chương
    if (story.author && story.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật chương này' });
    }

    const { title, content, chapter_number, status } = req.body;

    // Nếu thay đổi số chương, kiểm tra xem đã tồn tại chưa
    if (chapter_number && chapter_number !== chapter.chapter_number) {
      const existingChapter = await Chapter.findOne({
        story: chapter.story,
        chapter_number,
        _id: { $ne: chapter._id }
      });

      if (existingChapter) {
        return res.status(400).json({ message: 'Số chương này đã tồn tại' });
      }
    }

    const updateData = {
      title,
      content,
      chapter_number,
      status
    };

    // Loại bỏ các trường không được cung cấp
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    // Cập nhật chương
    chapter = await Chapter.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: chapter
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Xóa chương
// @route   DELETE /api/chapters/:id
// @access  Private
exports.deleteChapter = async (req, res, next) => {
  try {
    const chapter = await Chapter.findById(req.params.id);

    if (!chapter) {
      return res.status(404).json({ message: 'Không tìm thấy chương' });
    }

    // Lấy thông tin truyện
    const story = await Story.findById(chapter.story);

    // Kiểm tra quyền: chỉ người tạo truyện hoặc admin mới có thể xóa chương
    if (story.author && story.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền xóa chương này' });
    }

    await chapter.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Lấy tất cả chương của một truyện
// @route   GET /api/stories/:storyId/chapters
// @access  Public
exports.getChaptersByStory = async (req, res, next) => {
  try {
    // Kiểm tra storyId
    if (!req.params.storyId || !mongoose.Types.ObjectId.isValid(req.params.storyId)) {
      return res.status(400).json({
        success: false,
        message: 'ID truyện không hợp lệ'
      });
    }

    const chapters = await Chapter.find({ story: req.params.storyId })
      .sort({ chapter_number: 1 })
      .populate({
        path: 'story',
        select: 'title slug',
        populate: {
          path: 'author',
          select: 'username'
        }
      });

    res.status(200).json({
      success: true,
      count: chapters.length,
      data: chapters
    });
  } catch (err) {
    console.error(`Error getting chapters: ${err.message}`, err);
    next(err);
  }
}; 