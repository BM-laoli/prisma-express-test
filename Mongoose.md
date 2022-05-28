# 说明

> 这里的文档 是说明 Express + Mongoose 的各种 使用，参考文档 官方6.3 英文文档 和 CSDN的这片文章 <https://blog.csdn.net/weixin_45828332/article/details/114120710>
<https://blog.csdn.net/weixin_45828332/article/details/114119058>

## 理论知识

### 介绍

> 如果你需要玩 MongoDB 有些概念 你一定需要知道 就像你玩Mysql 你需要知道SQL 、tab、一对一、一对多 、外建、关系 等....

首先我们建立一个认知 **Schema生成Model，Model创造Document**
以下是详细说明：

Schema（模式对象） ——Schema 对象定义约束了数据库中的文档结构
Model ——Model 对象作为集合中的所有文档的表示，相当于MongoDB中的collection，它的每一个实例就是一个document文档
Document ——Document表示集合中的具体文档，相当于collection中的一个具体文档

### Schema

> Schema 在官方 mongoose 文档中它是 一个对象 很挺多属性的，我们最常用的属性有下面几个 Schema.add() 方法 ，Schema.pre() , Schema.post() 这些方法

Schema 是一个构造函数 我们需要new 一个 schema实例 去掉用 add pre post 这些方法,

1.Schema 的 构造参数

> 官方文档有两个参数 这里我不展开来，我们只取用到的东西
new Schema( definition ,[options])

```js
const schemaInstant = new Schema(  
  // 我们常用的
  {
    name: String,
    age: Number,
  } ,  
//  更多的配置 我们现在用不上
  {})
```

2.Schema 方法说明

add( object|Schema, prefix, cb )
Schema 创建好之后 追加字段

```js
const ToySchema = new Schema();
ToySchema.add({ name: 'string', color: 'string', price: 'number' });
// 创建Modal 的时候 不传参数，后续自己追加

const TurboManSchema = new Schema();
TurboManSchema.add(ToySchema).add({ year: Number });
// 连续追加，会进自动行合并 
```

pre( String | RegExp, options, cb )
为model定义 定义一个预挂钩。

```js
const toySchema = new Schema({ name: String, created: Date });

toySchema.pre('save', function(next) {
  if (!this.created) this.created = new Date;
  next();
});

toySchema.pre('validate', function(next) {
  if (this.name !== 'Woody') this.name = 'Woody';
  next();
});

// Equivalent to calling `pre()` on `find`, `findOne`, `findOneAndUpdate`.
toySchema.pre(/^find/, function(next) {
  console.log(this.getFilter());
});

// Equivalent to calling `pre()` on `updateOne`, `findOneAndUpdate`.
toySchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  console.log(this.getFilter());
});

toySchema.pre('deleteOne', function() {
  // Runs when you call `Toy.deleteOne()`
});

toySchema.pre('deleteOne', { document: true }, function() {
  // Runs when you call `doc.deleteOne()`
});
```

post( String | RegExp, options, cb )
为document定义一个 post hook

```js
const schema = new Schema(..);
schema.post('save', function (doc) {
  console.log('this fired after a document was saved');
});

schema.post('find', function(docs) {
  console.log('this fired after you ran a find query');
});

schema.post(/Many$/, function(res) {
  console.log('this fired after you ran `updateMany()` or `deleteMany()`');
});

const Model = mongoose.model('Model', schema);

const m = new Model(..);
m.save(function(err) {
  console.log('this fires after the `post` hook');
});

m.find(function(err, docs) {
  console.log('this fires after the post find hook');
});
```

add 方法是 追加字段的 的

### Model

Model 是依据Schema规则 生产出的 一个对象 ，Model负责从底层 MongoDB 数据库创建和读取文档。
它有非常多的方法 下面我们会一一的介绍，让我们先了解几个简单的 试试水

```js

const schema = new mongoose.Schema({ name: 'string', size: 'string' });
const Tank = mongoose.model('Tank', schema);

// 然后句可以开始操作了 比如新增 数据
const small = new Tank({ size: 'small' });

small.save(function (err) {
  if (err) return handleError(err);
  // saved!
});

// or
Tank.create({ size: 'small' }, function (err, small) {
  if (err) return handleError(err);
  // saved!
});

// 之后所有关于Tank 的CURD 全部通过这个实例来操作 这点需要注意
```

**上面的东西远远不够，记得做一个合格的🧱 工具人，后续需要优化**

目前MongoDB 所能够支持的类型
String ，Number， Date，Buffer，Boolean，Mixed，ObjectId，Array

### Create

> 主要的方法如下：

1. save
Model.prototype.save([options], [options.safe], [options.validateBeforeSave], [fn])

2. create
Model.create(doc(s), [callback])

3. InsertMany
Model.insertMany(doc(s), [options], [callback])

*具体的样子如下*

```js
someModal.save({name:"小明",grades:68})
someModal.create({name:"小明",grades:68})
someModal.insertMany({name:"小明",grades:68},{name:"小芳",grades:94})
```

### Retrieve

> 主要方法如下

1. find
Model.find(conditions, [projection], [options], [callback])

2.findById
Model.findById(id, [projection], [options], [callback])

3. findOne
Model.findOne([conditions], [projection], [options], [callback])

4. 复杂的操作符

```md
$where        直接指定 js函数为查询起

$or　　　　 或关系
$nor　　　 或关系取反
$gt　　　　 大于
$gte　　　 大于等于
$lt　　　　 小于
$lte　　　 小于等于
$ne　　　　 不等于
$in　　　　 在多个值范围内
$nin　　　 不在多个值范围内
$all　　　 匹配数组中多个值
$regex　　 正则，用于模糊查询
$size　　　 匹配数组大小
$maxDistance　 范围查询，距离（基于LBS）
$mod　　　　 取模运算
$near　　　 邻域查询，查询附近的位置（基于LBS）
$exists　　 字段是否存在
$elemMatch　 匹配内数组内的元素
$within　　　 范围查询（基于LBS）
$box　　　　 范围查询，矩形范围（基于LBS）
$center　　　 范围醒询，圆形范围（基于LBS）
$centerSphere　范围查询，球形范围（基于LBS）
$slice　　　　 查询字段集合中的元素（比如从第几个之后，第N到第M个元素

```

5. 查询方法
sort 排序
skip 跳过
limit 限制
select 显示字段
exect 执行
count 计数
distinct 去重

```js

someModal.find()

someModal.find({
  grades:{$gte:60}  // grades > 60 
}, {
  name:1, // 是否返回 name
  _id:0 // ) _id不返回
})

// 跳过前两条
someModal.find(
  null,null,{skip:2}
)

someModal.findById(id)
someModal.findOne(id)
someModal.findOne({
  $where:function () { // 注意不能用 => 函数 会导致this的丢失
    retrun this.grades == 1 
  }
})

// 依据 test 字段的值 ，从小到大 生序
someModal.find().sort('test').exec((err,docs)=>{
  console.log(docs)
})
// 降序
someModal.find().sort('-test').exec((err,docs)=>{
  console.log(docs)
})

```

### Update

> 方法如下

1. update
Model.update(conditions, doc, [options], [callback])

1. updateOne
Model.updateOne(conditions, doc, [options], [callback])

1. updateMany
Model.updateMany(conditions, doc, [options], [callback])

2. findByIdAndUpdate
Model.findByIdAndUpdate([conditions], [update], [options], [callback])

*一些细节*

```js
// 都是一样的用法 这里不详细的展开说明来
someModal.update({name:'小明'},{$set:{test:34}} ).exec() //set 把某值改成某值

someModal.findByIdAndUpdate(id,data)
```

### Delete

> 方法如下, 我们讲一个就好啦，讲一个最常用的，

```js
const res = await BookModel.findByIdAndRemove(id);
```

### 总结

> 上面我们只是非常非常的简单，说啦一些 mongoose 的内容，定位的快速入门，如果你希望深入了解，可以去mongoDB 官方文档 和 mongoose 官方文档

## 实战指南

### 连接MongoDB 和初始化的一些设计

> 第一步！先连接上数据库再说！
<https://developer.mozilla.org/zh-CN/docs/Learn/Server-side/Express_Nodejs/mongoose>

```js
// 首先我 划分了 一个文件夹./db 里面存的了一个config 和index ,config 暂时没用到 你可以依据自己实际情来
// ./db/idex.js
const mongoose = require('mongoose');
const dbConfig = require('./config');

const initConnection = async () => {
  // 注意mongoDB 的数据库密码 只对当前的库有效！
  // const connection = mongoose.connect("mongodb://admin:123456@192.168.101.10:27017/admin",
  //   { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true })
  return new Promise((resolve, reject) => {
    const connection = mongoose.connect('mongodb://192.168.101.10:27017/test', {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    mongoose.connection.on('connected', (err) => {
      resolve(connection);
    });

    mongoose.connection.on('error', (err) => {
      reject(err);
    });
  });
};

module.exports = initConnection

```

以上只是连接，我还划分了一些文件夹结构，以及分配了 一些 路由 和，设计了几张表

#### 首先文件夹结构如下

![](https://cdn.nlark.com/yuque/0/2022/png/1627571/1653142440884-30716469-9701-448f-b7a8-96943817b0ac.png)

#### 其次表设计如下

![](https://cdn.nlark.com/yuque/0/2022/png/1627571/1653142389734-c0cafa30-126c-4a1c-84be-6dbb324216b7.png)

我来具体的说明一下：
我们需要建立这样的系统 ：“图书管理系统”，首先我们的系统的主角是 books 它具备下面的属性
书名、摘要、作者、种类、ISBN;   作者需要有下面的字段。作者需要下面的属性：
名，姓，出生日期 死亡日期，名字，寿命，url wiki;  我们还需要有分类的信息，
名称，url（比如图片地址什么的） 。 我们还需要 书架信息 ：有哪些书 ，书的编号，书的状态（在库还是借走来） 到期时间。

注意  a 0 ... *b 表示*b必须包含 0 个或者 多个 a*，在 关系型数据库中 我们使用 外建，在mongoDB中我们使用id 做联合查询.
1..*   ===> 至少一个或者多个
0..* ===> 零个或者多个
1 ==> 有且 一个

按照上面的图来说他们具体的关系就是：

站在book角度：
genre 包含 一个或者多个book ，book 属于 一个 bookInstance ，book 有一个或者多个author

站在 genre 角度  包含零个或者多个book ，
站在 bookInstance 角度  包含零个 或者多个book ，
站在 author 角度  包含一个book

#### 最后我划分了一些路由，和初始化了一些代码

*./router/book.js*

```js
const express = require('express');

const book = express.Router();

// CRUD
book.post('/', async (req, res) => {
  res.json({
    message: 'create',
  });
});

book.get('/', async (req, res) => {
  res.json({
    message: 'get',
  });
});

book.put('/', async (req, res) => {
  res.json({
    message: 'delete',
  });
});

book.delete('/:id', async (req, res) => {
  res.json({
    message: `delete==> ${req.params.id}`,
  });
});

module.exports = book;

```

*./index.js*

```js
const express = require('express');
const bodyParser = require('body-parser');
const initConnection = require('./db');
const author = require('./routes/author');
const book = require('./routes/book');
const bookInstanceRouter = require('./routes/bookInstance');

const app = express();
app.use(bodyParser.json());

// 我们定义一个路由对User 和 Book 做路由的CRUD
app.use('/author', author);
app.use('/book', book);
app.use('/bookInstanceRouter', bookInstanceRouter);

initConnection().then(() => {
  app.listen(3000, () => {
    console.log('server start');
  });
});

```

*上面的东西 在commit :"connection & init"可以看到*

### 创建模型

> 上述我们创建了 mongodb的连接 和基础代码，现在我们需要构建 模型,

构建模型前 ，我们需要讨论 它的一些参数和方法
首先mongo支持的类型如下

String 定义字符串
Number 定义数字
Date 定义日期
Buffer 定义二进制
Boolean 定义布尔值
Mixed 定义混合类型
ObjectId 定义对象ID
Array 定义数组

*更多细节show your code*

```js
const mongoose = require('mongoose');
// 使用Schema
const Schema = mongoose.Schema;

// 定义Schema 切得到 Schema实例
const UserSchema = new Schema({
  name: String,
  title: String,
  unicode: {
    type: String,
    unique: true //只需要 unicode 为唯一值
  } ,
  family_name: String,
  first_name: {
    type: String,
    required: true,
    maxLength: 100,
    default:'goodName' // 默认值
  },
}, {
  // 自动给你加上 createdAt，updatedA t这两个字段，
  timestamps:true 
})

// 通过Schema 实例 获得Modal ( 后续的操作都在这里进行 )
const  UserSchema = mongoose.model('User', UserSchema);

// 附加一些验证和 额外的管道操作
// 自动生成全名
UserSchema.virtual('name').get(function() {
  return this.family_name + ', ' + this.first_name;
});


// 如果你需要关联另一个Model
const LocationInfoSchema = new Schema({
    city: String
})
const LocationInfoModal = mongoose.model('LocationInfo', LocationInfoSchema);

UserSchema.add({
  locationInfo: {
      type: Schema.ObjectId,
       ref: 'LocationInfo',
      required: true 
  }
})

// AuthModal.create({ name: "000" })
```

1. 首先我们创建相对独立的 schema 比如author

*./model/Author.js*

```js
const mongoose = require('mongoose');
const { DateTime } = require('luxon'); //for date handling

// 使用Schema
var Schema = mongoose.Schema;

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
```

其他更多的模型操作是一样的 这里不详细介绍了，由于是演示项目，其他的modal 没有加 virtual

### 创建create

> 在上一讲中，我们创建了模型，现在我们需要调整一下我们的项目结构，我们需要新增一个 controllers 文件夹，因为我们需要实施 controllers - service 类似的结构，这对大型项目是有好处的，然后还对 数据库..db/index.js 做了一下小修复

我们从 req 经过的路径开始构建，http --> router -> controller ->  service

*router*
./router/author.js

```js
const express = require('express');
const AuthorController = require('../controllers/authorController');
const author = express.Router();
// CRUD
author.post('/', AuthorController.create);
++++
module.exports = author;
```

*controller*
./controllers/authorController

```js
const { createAuthor } = require('../service/authorService');

const AuthorController = {
  create: async (req, res, next) => {
    const value = await createAuthor(req.body);
    res.json(value);
  },
};

module.exports = AuthorController;

```

*service*
./service/authorService

```js
const AuthorModel = require('../model/Author');

const createAuthor = async (data) => {
  // Model.create(doc(s), [callback])
  const res = await AuthorModel.create(data); // AuthorModel.save(data); 也可以
  return res;
};

module.exports = {
  createAuthor: createAuthor,
};

```

看就是这样简单！除了create 还有很多 inset的操作，请看官方文档哈, 本文不一一列举了

### 查询query

> 查询是非常简单, 我们把理论的东西运用下来就可以啦
我们从 req 经过的路径开始构建，http --> router -> controller ->  service
*router*

```js
++++ ( 此处省略重复内容 )
author.get('/', AuthorController.query);
++++
```

*controller*

```js
++++ ( 此处省略重复内容 )
const query = async (req, res, next) => {
  const value = await authorService.queryAuthor(req.query);
  res.json(value);
};
```

*service*

```js
const queryAuthor = async (query) => {
  // Model.find(conditions, [projection], [options], [callback])
  // const res = await AuthorModel.find(); // 查所有
  // const res = await AuthorModel.findById(query.id); // 查id
  // const res = await AuthorModel.find({ first_name: /a/ }); // 带其他条件查询 查询一条且name 含有a
  // const res = await AuthorModel.find().$where(function () {
  //   return this.first_name === 'Joney' || this.first_name === 'Aoda';
  // }); // 高级复杂查询 $where 使用js 函数
  // const res = await AuthorModel.findById(query.id, { first_name: 1, _id: 0 }); // 返回指定字段

  // 让我们使用 更加高高级的操作
  // sort 排序 skip跳过    limit 限制 select 显示字段 exect 执行 count 执行  distinct 去重
  const res = await AuthorModel.find().skip(1).exec();
  return res;
};
```

### 更新和删除update 和delete

> 我们看看 update 操作, 注意在 本次实战中，我们不去搞很多复杂操作, 复杂操作 自己去看mongose官方文档,比如 update updateOne UpdateMany findyByIdAndUpdate等...

我们从 req 经过的路径开始构建，http --> router -> controller ->  service

*router*

```js
author.put('/', AuthorController.update);
author.delete('/', AuthorController.deleteAuthor);
```

*controller*

```js

const update = async (req, res, next) => {
  const value = await authorService.update(req.query.id, req.body);
  res.json(value);
};

const deleteAuthor = async (req, res, next) => {
  const value = await authorService.findAndDelete(req.query.id);
  res.json(value);
};
```

*service*

```js

const update = async (id, data) => {
  const res = await AuthorModel.findByIdAndUpdate(id, data);
  return res;
};

const findAndDelete = async (id) => {
  const res = await AuthorModel.findByIdAndRemove(id);
  return res;
};
```

*上述代码 commit -m:"CRUD"*

### 前置钩子的运用

> 和上文一样，我们这里只介绍运用, 具体的文档在详细可以看 “理论知识+官方文档”

./model/Author.js

```js
++++
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
  console.log('我是pre方法1--find');
  next();
});
```

### 验证

> 我们作为测试程序，给AuthorSchema 添加一个 age 和属性来测试它的验证
首先我们修改来原来的Author Schema

```js
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

```

然后我们发现我们的代码还是有点危险的，所以我们添加来cath操作

```js

const create = async (req, res, next) => {
  try {
    const value = await authorService.createAuthor(req.body);
    res.json(value);
  } catch (error) {
    res.json(error);
  }
};
```

## 关于关联操作我想说的

> 按照前文描述的，的数据关系图设计，我们需要实现 Book 和 book 的分类 genre

*我们先实现 各自的Modal*

./model/Gene.js

```js
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
module.exports = mongoose.model('Genre', GenreSchema);

```

./model/Book.js

```js
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BookSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.ObjectId,
    ref: 'Author',
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  isbn: {
    type: String,
    required: true,
  },
  genre: [
    {
      type: Schema.ObjectId,
      ref: 'Genre',
    },
  ],
  url: String,
});

// Export model.
module.exports = mongoose.model('Book', BookSchema);

```

Nice 看起来这些东西你都准备好啦，现在让我们来实现这些对Genre的CRUD，首先我们先实现genre 它相对i独立, 主要还是CV

*我们添加 个字的Service Controller 和 router*
下面的内容是实现 一些空的代码结构

我们换一个角度，在做业务中可能更加的合适 Service -> controller -> router -前端/tempalte语法

*service*

```js
const GenreModel = require('../model/Genre');

const createGenre = async (data) => {
  const res = await GenreModel.create(data);
  return res;
};

const queryGenre = async (query) => {
  const res = await GenreModel.find();
  return res;
};

const update = async (id, data) => {
  const res = await GenreModel.findByIdAndUpdate(id, data);
  return res;
};

const findAndDelete = async (id) => {
  const res = await GenreModel.findByIdAndRemove(id);
  return res;
};

module.exports = {
  createGenre: createGenre,
  queryGenre: queryGenre,
  update: update,
  findAndDelete: findAndDelete,
};

```

*controller*

```js
const genreService = require('../service/genreService');

const create = async (req, res, next) => {
  try {
    const value = await genreService.createGenre(req.body);
    res.json(value);
  } catch (error) {
    res.json(error);
  }
};

const query = async (req, res, next) => {
  const value = await genreService.queryGenre(req.query);
  res.json(value);
};

const update = async (req, res, next) => {
  const value = await genreService.update(req.query.id, req.body);
  res.json(value);
};

const deleteGenre = async (req, res, next) => {
  const value = await genreService.findAndDelete(req.query.id);
  res.json(value);
};

module.exports = {
  create: create,
  query: query,
  update: update,
  deleteGenre: deleteGenre,
};

```

*router*

```js
const express = require('express');
const generaController = require('../controllers/genraController');
const generaRouter = express.Router();

// CRUD
generaRouter.post('/', generaController.create);
generaRouter.get('/', generaController.query);
generaRouter.put('/', generaController.update);
generaRouter.delete('/', generaController.deleteGenre);

module.exports = generaRouter;
```

经过上面的操作，我们已经能够 完成Genre的CRUD 了

最后我们来哦实现book ，这个时候我们需要把它和author + genre 关联起来
> 需要使用聚合操作 来实现 关联字段的查询

实际上，我们最常用到的场景 就是 关联查询 和关联修改

*service*
./service/bookService.js

```js
// 一般来说，我们有两种方式去去处理关联数据，
// 1.是使用mongoose自带额关联查询（需要定义外健=比如ObjectID ref这种）,而且外建必须要在主表中

const queryBook = async (query) => {
  BookModel.find().exec();
  // 子表关联主表查询，populate里面为子表外键
  const res = await BookModel.find()
    .populate('author')
    .populate('genre')
    .exec();
  return res;
};

// 2. 使用聚合查询（聚合查询是一个骚操作，可操作性很高，会来聚合其他都很简单没有什么处理不了的问题在mongodb 这一块）
  // 推荐 用法 ( 假设我们没有关联 ，我们我们可以用lookup 进行左关联 ，类似连表查询)

const queryBook = async (query) => {
  BookModel.find().exec();
  // 推荐 用法 ( 假设我们没有关联 ，我们我们可以用lookup 进行左关联 ，类似连表查询)
  const res = await BookModel.aggregate([
    {
      $lookup: {
        // 左连接
        from: 'authors', // 关联到 author 表
        localField: 'author', // book 表关联的字段
        foreignField: '_id', // order 表关联的字段
        as: 'names',
      },
    },
  ]).exec();
  return res;
};
```

关于聚合查询 官方有完整的文章请去查阅，我借鉴来一个CSDN的文章
<https://blog.csdn.net/u011113654/article/details/80353013>
<https://www.cnblogs.com/showtime813/p/4564157.html>

> 最后，本阶段最终代码在 -commiit -m "relation"

## Node的部署 -性能和稳定性

本小节的注意，第一件事：“完善我们的服务”，最后我把 BookInstance 的东西全部写完啦，

> 感觉这一讲好像太多啦，不是我们的主题，但是 我们的目标：“完成完整的Node项目”，包括了，开发和部署 ，理论上你应该还需要包括CI，但是CI 我之前的文章由详细说过，你可以自己去操作，我们现在重点来讲一下 ，Node 的压力测试 和部署, ( 要知道 ，一个可以达到生成标准Nodejs service 程序 可能不止我们说的这些，但我尽量的涵盖每一个重要的点 )，接下来的内容更加偏向devops的世界

### 生产最佳实践：性能和可靠性

> 这个是express 官方为我们提供的一些有用的建议,  我们先来看看哈, 这里面的内容主要是分了两个部分，一个编码需要注意的地方，和部署需要注意的地方，<https://expressjs.com/en/advanced/best-practice-performance.html#ensure-your-app-automatically-restarts>

#### 编码需要的地方

- 使用 gzip 压缩
- 不要使用同步函数
- 正确记录
- 正确处理异常

```js
// ------------ 使用gzip 进行 传输数据的压缩🗜️ ，但是一般来说 Nginx等会帮我们处理这个事，
const compression = require('compression')
const express = require('express')
const app = express()
app.use(compression())
// 只需要向上面一样做就好啦，运用这个 compression 这个中间件就能处理了

// ------------  不要使用同步方法，你这样操作会导致堵塞
// 这里主要是指，虽然在Nodej中很多的API 提供了Sync同步的方法，但是我们还是不推荐的，尽量使用异步 去处理


// ------------ 正确的记录
// 实际上我们需要记录日志，主要是希望看到 服务上线之后，如果有异常我们能准备了其发生原因然后准确的修复它，如果没有日志我们会很被动,
// 一般来说 一些同步的方法 是不建议 使用的比如 console之类的东西，最常用的解决方案是用一成熟的lib 去做log记录，比如 winston


// ------------正确处理异常
// 有时候，我们的程序依然必不可免的出现异常，在 任何程序中，你都应该妥善的处理他们，不管你是client 还是service 你都要处理他们，你可不希望 它影响你最终的结果，在express中我们有这样的处方
// 对于premise 记得添加 catch 对于async 方式的，需要try catch，并且把error 向外传递, 而且你应遵循 Nodejs中的原则：“错误优先” 需要注意⚠️ 你最不应该做的事情是 去监听 uncaughtException 会改变遇到异常的进程的默认行为容易导致：“僵尸进程”, 下面的处理方式我们认为是好的
app.get('/search', (req, res) => {
  // Simulating async operation
  setImmediate(() => {
    const jsonStr = req.query.params
    try {
      const jsonObj = JSON.parse(jsonStr)
      res.send('Success')
    } catch (e) {
      res.status(400).send('Invalid JSON string')
    }
  })
})

app.get('/', (req, res, next) => {
  // do some sync stuff
  queryDb()
    .then((data) => makeCsv(data)) // handle data
    .then((csv) => { /* handle csv */ })
    .catch(next)
})

app.use((err, req, res, next) => {
  // handle error
})


const wrap = fn => (...args) => fn(...args).catch(args[2])

app.get('/', wrap(async (req, res, next) => {
  const company = await getCompanyById(req.query.id)
  const stream = getLogoStreamById(company.id)
  stream.on('error', next).pipe(res)
}))
```

#### 部署需要注意的地方

- 将 NODE_ENV 设置为“生产”
- 确保您的应用程序自动重启
- 在集群中运行您的应用程序
- 缓存请求结果
- 使用负载均衡器
- 使用反向代理

> 这里更多的关注 代码之外的事情，比如自动重启等等

1. 我们先来做第一件事情，设置环境

> 经过官方 验证 环境设置非常重要 NODE_ENV = "production"时 是普通 模式 性能下的 三倍

 我们可以这样 设置 package.json

```json
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "export NODE_ENV='development' && node app.js",
    "build": "export NODE_ENV='production' && node app.js"
}
```

2. 确保您的应用程序自动重启
3. 在集群中运行您的应用程序

> 这两个操作我们都可以在 nodejs 进程管理工具 pm2 上完成，非常的简单，后文中我们介绍了具体的实现细节，pm2官方文档 <https://pm2.keymetrics.io/docs/usage/application-declaration/>

```shell
npm i  -g pm2
# int 一下，生成 一个配置
pm2 init simple 
```

构建配置文件, 在项根目录 ecosystem.config.js

```js
// 名称任意，按照个人习惯来
module.exports = {
  apps: [
    {
       name   : "app1",
        script : "./app.js",
        max_restarts: 20, // 设置应用程序异常退出重启的次数，默认15次（从0开始计数）
        cwd: "./", // 应用程序所在的目录
        exec_mode: "cluster", // 应用程序启动模式，这里设置的是 cluster_mode（集群），默认是 fork
        log_date_format:"YYYY-MM-DD HH:mm Z", // 日志时间格式
        out_file:"./logOut.log",
        instances：2, // 启动两个实例 
        env_production: {
          NODE_ENV: "production"
        },
        env_development: {
          NODE_ENV: "development"
        }
      }
  ],
};
```

```shell
pm2 start ecosystem.config.js
```

对于服务器自动重启后，要自动运行node服务，需要依赖服务的编排等功能，我们也可以人肉的设置一些配置,
Systemd 是一个 Linux 系统和服务管理器。大多数主要的 Linux 发行版都采用 systemd 作为其默认的 init 系统。

systemd 服务配置文件称为单元文件，文件名以.service. 这是一个直接管理 Node 应用程序的示例单元文件。替换<angle brackets>您的系统和应用程序中包含的值：
具体的参考手册是==> <https://www.freedesktop.org/software/systemd/man/systemd.unit.html>

```
[Unit]
Description=<Awesome Express App>

[Service]
Type=simple
ExecStart=/usr/local/bin/node </projects/myapp/index.js>
WorkingDirectory=</projects/myapp>

User=nobody
Group=nogroup

# Environment variables:
Environment=NODE_ENV=production

# Allow many incoming connections
LimitNOFILE=infinity

# Allow core dumps for debugging
LimitCORE=infinity

StandardInput=null
StandardOutput=syslog
StandardError=syslog
Restart=always

[Install]
WantedBy=multi-user.target
```

> 实际上，上面的内容 Systemd 相关的你了解就好啦，pm2 也提供了快捷的设置方式

```shell
# 设置pm2开机自启
#（可选项：ubuntu, centos, redhat, gentoo, systemd, darwin, amazon）
# 然后按照提示需要输入的命令进行输入, 最后保存设置
pm2 startup centos 
pm2 save
```

4. 缓存请求结果

> 我们依然可以使用Nginx 来处理请求缓存！注意是Http的请求缓存 和redis 没有关系！文档地址在这里 <https://serversforhackers.com/c/nginx-caching>

5. 使用负载均衡器

> 关于负载均衡，我们可以部署多个node service 实例，然后使用Nginx 去处理。也可以使用 pm2 ，对没错pm2 自带有这个功能，不需要特殊设置

6. 使用反向代理

> 采用微服务 架构下，不同的服务之间要频繁的额通信，我们使用反向代理，使得他们的掉用在“内网”进行，或者在同一k8s 集群下进行，会大幅度提升 通信效率。最常用工具依然是Nginx

<https://www.digitalocean.com/community/tutorials/an-introduction-to-haproxy-and-load-balancing-concepts>

#### 实际操作

> 好以上是理论知识，现在我们啦实战 ，

1. 首先我们需要加上gzip 等压缩，但是如果你使用nginx 这个东西也可以省略不写，nginx 自带就能处理，而且简单。我们这儿不用nginx，但是在实际项目产线必定80%就是Nginx, 虽然你不需要用，但是你得知道它怎么用

```js
++++
const compression = require('compression');
++++
const app = express();
app.use(compression());
```

2. 正确的处理日志

> 我们使用 winston，当然我在nest 文章中使用的是log4j，当然我们也可以使用 winston, 如果我们使用pm2 那么这个实际上也是可选的，但是你如果希望自己处理一些业务什么上的log 那么自定义的这种东西还是有意义的. 关于winston 我们可以去看官方文档，由于我们这个项目 没有复杂的业务，我们只是简单的记录了一些路由日志和错误日志 而已

```js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'log/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'log/combined.log' }),
  ],
});

module.exports = {
  logger: logger,
};

```

我们先定义，后面在使用

3. 正确的处理 异常

> 我们结合 上面讲到的logger 就能很完美的处理 程序中的一些异常情况

```js
// 在appjs中 给定一个路由 全局处理 未捕获的异常
// 设置一个路由，如果前面的都有问题，就到这里来处理错误
app.use((err, req, res, next) => {
  logger.error({
    level: 'error',
    message: err.message,
  });
  res.json(err);
});

// 在utils 下定义一个wrap 文件减少 try 冗余代码
module.exports = {
  // 一个包装工具 🔧可以马上把 路由函数的的error 处理到next 去，
  // 减少try 的冗余代码
  wrap:
    (fn) =>
    (...args) =>
      fn(...args).catch(args[2]),
};

// 在每个路由处理中 都加上 wrap，一档有err 它会自动next，最后走到我这个err 路由中
const express = require('express');
const generaController = require('../controllers/genraController');
const generaRouter = express.Router();
const { wrap } = require('../utils/');

// CRUD
generaRouter.post('/', wrap(generaController.create));
generaRouter.get('/', wrap(generaController.query));
generaRouter.put('/', wrap(generaController.update));
generaRouter.delete('/', wrap(generaController.deleteGenre));

module.exports = generaRouter;

```

4. 修改环境

> 对于修改环境 ，我们可以很简单的咋package中实现, 但是我们可以使用pm2 ，来更好操作

```json
"start": "export NODE_ENV='development' && node app.js ",
"build": "export NODE_ENV='production' && node app.js "
```

5. 使用pm2

> 首先我以我的这个小demo项目，小mac 机器做为演练环境

```shell
# 设置pm2 nodejs 本体的进程 ，在系统重启的时候自动重启
npm i -g pm2 
# 设置为开启自启动
pm2 startup
pm2 save
# pm2 init 生成config 文件
pm2 init simple

# 编辑这个最简单的文件

```

```js
module.exports = {
  apps: [
    {
      name: 'app1',
      script: './app.js',
      max_restarts: 20, // 设置应用程序异常退出重启的次数，默认15次（从0开始计数）
      cwd: './', // 应用程序所在的目录
      exec_mode: 'cluster', // 应用程序启动模式，这里设置的是 cluster_mode（集群），默认是 fork 我们后面就讲 这是一些多进程的方式
      log_date_format: 'YYYY-MM-DD HH:mm Z', // 日志时间格式
      out_file: './log/pm2.log',
      instances: 2, // 启动两个实例
      env_production: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
    },
  ],
};

```

```shell
# 最后直接去run 就好啦，当然你可以把这个东西写在你的 script中
pm2 start ecosystem.config.js
```

6. 负载均衡 方向代理 http缓存

> 关于负载均衡这个话题，我们完全可以是哟Nginx去完成，但是使用pm2 也是ok的，怎么说呢，这个话题比较大且空，所以这里不过过度介绍啦，基本上 负载均衡 这件事 pm2 也是内置且自动管理的。在上述的一些优化中，我们讨论了 有关部署的话题 基本上一句话都离不开pm2 ，比如：“修改环境变量pm2 能做”、“负载均衡和缓存pm2 也能处理” 处理异常和自动弄重启pm2 也能处理，....很多事情有关Node 部署和运维的pm2 都可以处理。所以我们有机会 ，详细的介绍一下，现在你只需要了解这样一件事**你的Node 写好啦丢配置好一些配置，直接丢给pm2处理** 就可了。

*上述的代码在commi-m "feature：优化和pm2部署配置"*

### 压力测试/和多线程调优 - 打造一个持续且健壮的程序

> 压力测试/和多线程调优 - 打造一个持续且健壮的程序.
