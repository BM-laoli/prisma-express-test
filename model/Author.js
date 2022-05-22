const mongoose = require('mongoose');
const { DateTime } = require('luxon'); //for date handling

// 使用Schema
const Schema = mongoose.Schema;

// 得到AuthSchema
const AuthorSchema = new Schema({
  first_name: {
    type: String,
    required: true,
    maxLength: 100,
  },
  family_name: {
    type: String,
    required: true,
    maxLength: 100,
  },
  date_of_birth: {
    type: Date,
  },
  date_of_death: {
    type: Date,
  },
});

// 定义一些虚拟 key ，一般来说你用不到哈
AuthorSchema.virtual('lifespan').get(function () {
  var lifetime_string = '';
  if (this.date_of_birth) {
    lifetime_string = DateTime.fromJSDate(this.date_of_birth).toLocaleString(
      DateTime.DATE_MED,
    );
  }
  lifetime_string += ' - ';
  if (this.date_of_death) {
    lifetime_string += DateTime.fromJSDate(this.date_of_death).toLocaleString(
      DateTime.DATE_MED,
    );
  }
  return lifetime_string;
});

AuthorSchema.virtual('date_of_birth_yyyy_mm_dd').get(function () {
  return DateTime.fromJSDate(this.date_of_birth).toISODate(); //format 'YYYY-MM-DD'
});

AuthorSchema.virtual('date_of_death_yyyy_mm_dd').get(function () {
  return DateTime.fromJSDate(this.date_of_death).toISODate(); //format 'YYYY-MM-DD'
});

// 如果你后续需要新增 字段
// AuthorModel.add({ s:  String })

// 得到 modal
module.exports = mongoose.model('Author', AuthorSchema);
