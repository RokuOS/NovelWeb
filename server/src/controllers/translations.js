const Translation = require('../models/Translation');
const Chapter = require('../models/Chapter');
const Story = require('../models/Story');
const { validationResult } = require('express-validator');

// @desc    Lấy tất cả bản dịch của một chương
// @route   GET /api/chapters/:chapterId/translations
// @access  Public
exports.getTranslations = async (req, res, next) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);

    if (!chapter) {
      return res.status(404).json({ message: 'Không tìm thấy chương' });
    }

    const translations = await Translation.find({ chapter: req.params.chapterId })
      .sort({ segment_index: 1 })
      .populate('user', 'username');

    res.status(200).json({
      success: true,
      count: translations.length,
      data: translations
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Lấy một bản dịch theo ID
// @route   GET /api/translations/:id
// @access  Public
exports.getTranslation = async (req, res, next) => {
  try {
    const translation = await Translation.findById(req.params.id)
      .populate('user', 'username')
      .populate({
        path: 'chapter',
        select: 'title chapter_number story',
        populate: {
          path: 'story',
          select: 'title'
        }
      });

    if (!translation) {
      return res.status(404).json({ message: 'Không tìm thấy bản dịch' });
    }

    res.status(200).json({
      success: true,
      data: translation
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Tạo bản dịch mới
// @route   POST /api/chapters/:chapterId/translations
// @access  Private
exports.createTranslation = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const chapter = await Chapter.findById(req.params.chapterId);

    if (!chapter) {
      return res.status(404).json({ message: 'Không tìm thấy chương' });
    }

    const { original_text, translated_text, segment_index, is_machine_translation } = req.body;

    // Kiểm tra xem đoạn văn bản này đã có bản dịch chưa
    const existingTranslation = await Translation.findOne({
      chapter: req.params.chapterId,
      segment_index
    });

    if (existingTranslation) {
      return res.status(400).json({ message: 'Đoạn văn bản này đã có bản dịch' });
    }

    const translation = await Translation.create({
      chapter: req.params.chapterId,
      original_text,
      translated_text,
      segment_index,
      is_machine_translation: is_machine_translation || false,
      user: req.user.id
    });

    res.status(201).json({
      success: true,
      data: translation
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cập nhật bản dịch
// @route   PUT /api/translations/:id
// @access  Private
exports.updateTranslation = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const translation = await Translation.findById(req.params.id);

    if (!translation) {
      return res.status(404).json({ message: 'Không tìm thấy bản dịch' });
    }

    // Nếu đây là bản dịch của người khác, chỉ admin mới có thể cập nhật
    if (translation.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật bản dịch này' });
    }

    const { translated_text, is_machine_translation } = req.body;

    const updateData = {
      translated_text,
      is_machine_translation
    };

    // Loại bỏ các trường không được cung cấp
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const updatedTranslation = await Translation.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: updatedTranslation
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Xóa bản dịch
// @route   DELETE /api/translations/:id
// @access  Private
exports.deleteTranslation = async (req, res, next) => {
  try {
    const translation = await Translation.findById(req.params.id);

    if (!translation) {
      return res.status(404).json({ message: 'Không tìm thấy bản dịch' });
    }

    // Chỉ người tạo hoặc admin mới có thể xóa
    if (translation.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền xóa bản dịch này' });
    }

    await translation.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Dịch tự động một chương
// @route   POST /api/chapters/:chapterId/machine-translate
// @access  Private
exports.machineTranslateChapter = async (req, res, next) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);

    if (!chapter) {
      return res.status(404).json({ message: 'Không tìm thấy chương' });
    }

    // Kiểm tra quyền: chỉ người tạo truyện, admin hoặc người có quyền đóng góp mới có thể dịch
    const story = await Story.findById(chapter.story);
    if (story.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền dịch chương này' });
    }

    // Lấy nội dung chương và chia thành các đoạn văn
    const content = chapter.content;
    const paragraphs = content.split('\n\n').filter(p => p.trim());

    // Tạm thời ở đây, chúng ta giả định rằng có một API dịch tự động
    // Trong thực tế, bạn sẽ cần tích hợp với một dịch vụ dịch máy như Google Translate, Bing Translator, v.v.
    const translations = [];
    
    // Tạo các bản dịch cho từng đoạn văn
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];
      
      // Kiểm tra xem đoạn văn này đã có bản dịch chưa
      const existingTranslation = await Translation.findOne({
        chapter: chapter._id,
        segment_index: i
      });

      if (!existingTranslation) {
        // Ở đây, chúng ta sẽ sử dụng một dịch vụ dịch tự động thực tế
        // Nhưng tạm thời, chúng ta sẽ giả định kết quả
        const translatedText = `[Bản dịch tự động cho đoạn ${i+1}]: ${paragraph.substring(0, 50)}...`;
        
        const translation = await Translation.create({
          chapter: chapter._id,
          original_text: paragraph,
          translated_text: translatedText,
          segment_index: i,
          is_machine_translation: true,
          user: req.user.id
        });
        
        translations.push(translation);
      }
    }

    // Cập nhật trạng thái chương
    chapter.has_machine_translation = true;
    await chapter.save();

    res.status(200).json({
      success: true,
      count: translations.length,
      message: `Đã dịch tự động ${translations.length} đoạn văn`,
      data: translations
    });
  } catch (err) {
    next(err);
  }
}; 