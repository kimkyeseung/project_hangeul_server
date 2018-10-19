const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const styleSchema = new Schema({
  name: String,
  url: {
    type: String,
    required: true
  },
  font_id: Schema.Types.ObjectId
});

const Style = mongoose.model('Style', styleSchema);

module.exports = Style;
