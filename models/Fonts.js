const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fontSchema = new Schema({
  designer: String,
  monospaced: Boolean,
  description: String,
  display_name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  family: {
    type: String,
    required: true
  },
  styles: [String],
  liked: [Schema.Types.ObjectId],
  dummy_text: String
});

const Font = mongoose.model('Font', fontSchema);

module.exports = Font;
