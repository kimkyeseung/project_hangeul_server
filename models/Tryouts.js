const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tryoutSchema = new Schema({
  user_id: [{type: Schema.Types.ObjectId}],
  html: String,
  shortend_url: {
    type: String,
    required: true
  },
  font_list: [{
    font_id: Schema.Types.ObjectId,
    style: String
  }]
});

const Tryout = mongoose.model('Tryout', tryoutSchema);

module.exports = Tryout;
