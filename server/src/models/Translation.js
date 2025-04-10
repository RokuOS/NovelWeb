const mongoose = require('mongoose');

const TranslationSchema = new mongoose.Schema({
  chapter: {
    type: mongoose.Schema.ObjectId,
    ref: 'Chapter',
    required: true
  },
  original_text: {
    type: String,
    required: [true, 'Vui lòng nhập văn bản gốc'],
    trim: true
  },
  translated_text: {
    type: String,
    required: [true, 'Vui lòng nhập văn bản đã dịch'],
    trim: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  is_machine_translation: {
    type: Boolean,
    default: false
  },
  edited_count: {
    type: Number,
    default: 0
  },
  segment_index: {
    type: Number,
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
});

// Create compound index
TranslationSchema.index({ chapter: 1, segment_index: 1 }, { unique: true });

// Update the updatedAt field and increment edited_count on update
TranslationSchema.pre('findOneAndUpdate', function(next) {
  this.set({ 
    updatedAt: Date.now(),
    $inc: { edited_count: 1 }
  });
  next();
});

// Update chapter's is_translated status when a translation is created or updated
TranslationSchema.post('save', async function() {
  try {
    const Chapter = this.model('Chapter');
    const chapter = await Chapter.findById(this.chapter);
    
    if (chapter) {
      // If this is a machine translation, update has_machine_translation flag
      if (this.is_machine_translation && !chapter.has_machine_translation) {
        await Chapter.findByIdAndUpdate(this.chapter, { has_machine_translation: true });
      }
      
      // Check if all segments are translated (logic would depend on your implementation)
      // For simplicity, we're just setting is_translated to true here
      await Chapter.findByIdAndUpdate(this.chapter, { is_translated: true });
    }
  } catch (err) {
    console.error('Error updating chapter translation status:', err);
  }
});

module.exports = mongoose.model('Translation', TranslationSchema); 