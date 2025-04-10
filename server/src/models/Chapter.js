const mongoose = require('mongoose');

const ChapterSchema = new mongoose.Schema({
  story: {
    type: mongoose.Schema.ObjectId,
    ref: 'Story',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề chương'],
    trim: true,
    maxlength: [200, 'Tiêu đề không được quá 200 ký tự']
  },
  content: {
    type: String,
    required: [true, 'Vui lòng nhập nội dung chương'],
    minlength: [10, 'Nội dung chương phải có ít nhất 10 ký tự']
  },
  chapter_number: {
    type: Number,
    required: [true, 'Vui lòng nhập số chương']
  },
  views: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['published', 'draft'],
    default: 'published'
  },
  is_translated: {
    type: Boolean,
    default: false
  },
  has_machine_translation: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Reverse populate with virtuals
ChapterSchema.virtual('translations', {
  ref: 'Translation',
  localField: '_id',
  foreignField: 'chapter',
  justOne: false
});

// Create index for faster queries
ChapterSchema.index({ story: 1, chapter_number: 1 }, { unique: true });

// Update the updatedAt field on update
ChapterSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Update story's total_chapters count when a chapter is created
ChapterSchema.post('save', async function() {
  try {
    const Story = this.model('Story');
    const count = await this.model('Chapter').countDocuments({ story: this.story });
    await Story.findByIdAndUpdate(this.story, { total_chapters: count });
  } catch (err) {
    console.error('Error updating story chapter count:', err);
  }
});

// Update story's total_chapters count when a chapter is removed
ChapterSchema.post('remove', async function() {
  try {
    const Story = this.model('Story');
    const count = await this.model('Chapter').countDocuments({ story: this.story });
    await Story.findByIdAndUpdate(this.story, { total_chapters: count });
  } catch (err) {
    console.error('Error updating story chapter count:', err);
  }
});

module.exports = mongoose.model('Chapter', ChapterSchema); 