const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const GenreSchema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 100,
  },
  url: String,
});

// Export model.
module.exports = mongoose.model('Genre', GenreSchema, 'genres');
