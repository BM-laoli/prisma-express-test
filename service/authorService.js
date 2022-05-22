const AuthorModel = require('../model/Author');

const createAuthor = async (data) => {
  // Model.create(doc(s), [callback])
  const res = await AuthorModel.create(data); // AuthorModel.save(data); 也可以
  return res;
};

const queryAuthor = async (query) => {
  // Model.find(conditions, [projection], [options], [callback])
  const res = await AuthorModel.find(); // 查所有
  // const res = await AuthorModel.findById(query.id); // 查id
  // const res = await AuthorModel.find({ first_name: /a/ }); // 带其他条件查询 查询一条且name 含有a
  // const res = await AuthorModel.find().$where(function () {
  //   return this.first_name === 'Joney' || this.first_name === 'Aoda';
  // }); // 高级复杂查询 $where 使用js 函数
  // const res = await AuthorModel.findById(query.id, { first_name: 1, _id: 0 }); // 返回指定字段

  // 让我们使用 更加高高级的操作
  // sort 排序 skip跳过    limit 限制 select 显示字段 exect 执行 count 执行  distinct 去重
  // const res = await AuthorModel.find().skip(1).exec();
  return res;
};

const update = async (id, data) => {
  const res = await AuthorModel.findByIdAndUpdate(id, data);
  return res;
};

const findAndDelete = async (id) => {
  const res = await AuthorModel.findByIdAndRemove(id);
  return res;
};

module.exports = {
  createAuthor: createAuthor,
  queryAuthor: queryAuthor,
  update: update,
  findAndDelete: findAndDelete,
};
