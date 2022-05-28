const mongoose = require('mongoose');
const { DateTime } = require('luxon'); //for date handling
const { logger } = require('../log');
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

// 前置钩子 在 scheme 实例上使用 pre 操作执行前， post 操作执行前后
// 下面的这些操作执行，都会被监听
/**
 init
​ validate
​ save
​ remove
​ count
​ find
​ findOne
​ findOneAndRemove
​ findOneAndUpdate
​ insertMany
​ update 
 */
AuthorSchema.pre('find', function (next) {
  logger.info({
    level: 'info',
    message: 'find update',
  });
  next();
});
// 如果你后续需要新增 字段
AuthorSchema.add({
  age: {
    type: Number,
    required: true,
    default: 18,
    min: 16,
    max: 75,
    // 初次之外还更多的操做 请查阅官方文档
  },
});

// 得到 modal
module.exports = mongoose.model('Author', AuthorSchema, 'authors');
