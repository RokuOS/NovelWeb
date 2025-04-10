const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const StorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề truyện'],
    trim: true,
    maxlength: [200, 'Tiêu đề không được quá 200 ký tự']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả truyện'],
    maxlength: [5000, 'Mô tả không được quá 5000 ký tự']
  },
  coverImage: {
    type: String,
    default: 'default-cover.jpg'
  },
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'dropped'],
    default: 'ongoing'
  },
  views: {
    type: Number,
    default: 0
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    },
    users: [RatingSchema]
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
StorySchema.virtual('chapters', {
  ref: 'Chapter',
  localField: '_id',
  foreignField: 'story',
  justOne: false
});

// Tạo virtual slug từ title
StorySchema.virtual('slug').get(function() {
  return this.title
    ? this.title
        .toLowerCase()
        .replace(/[^\w\sÀ-ÿ]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    : this._id.toString();
});

// Update the updatedAt field on update
StorySchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Cascade delete chapters when a story is deleted
StorySchema.pre('remove', async function(next) {
  await this.model('Chapter').deleteMany({ story: this._id });
  next();
});

module.exports = mongoose.model('Story', StorySchema); 