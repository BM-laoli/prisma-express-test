# 说明

> 这里的文档 是说明 Express + Mongoose 的技术文档，参考文档 官方6.3 英文文档 和 CSDN的这片文章 <https://blog.csdn.net/weixin_45828332/article/details/114120710>
<https://blog.csdn.net/weixin_45828332/article/details/114119058>

## 理论知识

### 介绍

> 如果你需要玩 MongoDB ，有些概念 你一定需要知道 就像你玩Mysql 你需要知道SQL 、tab、一对一、一对多 、外建、关系 等....

- 首先我们建立一个认知 **Schema生成Model，Model创造Document**
以下是详细说明：

- Schema（模式对象） ——Schema 对象定义约束了数据库中的文档结构，

- Model ——Model 对象作为集合中的所有文档的表示，相当于MongoDB中的collection，
它的每一个实例就是一个document文档

- Document ——Document表示集合中的具体文档，相当于collection中的一个具体文档

### Schema

> Schema 在官方 mongoose 文档中它是 一个对象 ，有挺多属性的，我们最常用的属性有下面几个：Schema.add() 方法 ，Schema.pre() , Schema.post() 这些方法

Schema 是一个构造函数 我们需要new 一个 schema实例 ，然后使用实例 去调用 add pre post 这些方法,

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

2. findById
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

> 第一步！先连接上数据库再说！这里我们还引用的一篇文章的知识，需要的请点击这里
<https://developer.mozilla.org/zh-CN/docs/Learn/Server-side/Express_Nodejs/mongoose>

```js
// 首先我 划分了 一个文件夹./db 里面存的了一个config 和index ,config 暂时没用到 你可以依据自己实际情来
// ./db/idex.js
const mongoose = require('mongoose');
const dbConfig = require('./config');

const initConnection = async () => {
  // 注意mongoDB 的数据库密码 只对当前的库有效！如果你是有秘密的
  // 你需要这样写 指定密码 和 索引的库 authSource=admin

  // const connection = mongoose.connect("mongodb://admin:123456@192.168.101.10:27017/admin",
  //   { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true })
  return new Promise((resolve, reject) => {
    const connection = mongoose.connect('mongodb://root:12345@192.168.101.10:27017/test?authSource=admin', {
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

以上只是连接数据库，我还划分了一些文件夹结构，以及分配了 一些 路由 和，设计了几张表

#### 首先文件夹结构如下

![](https://cdn.nlark.com/yuque/0/2022/png/1627571/1653142440884-30716469-9701-448f-b7a8-96943817b0ac.png)

#### 其次表设计如下

![](https://cdn.nlark.com/yuque/0/2022/png/1627571/1653142389734-c0cafa30-126c-4a1c-84be-6dbb324216b7.png)

我来具体的说明一下：

1. 我们需要建立这样的系统 ：“图书管理系统”，首先我们的系统的主角是 books 它具备下面的属性
书名、摘要、作者、种类、ISBN;   作者需要有下面的字段。作者需要下面的属性：
名，姓，出生日期 死亡日期，名字，寿命，url wiki;  我们还需要有分类的信息，
名称，url（比如图片地址什么的） 。 我们还需要 书架信息 ：有哪些书 ，书的编号，书的状态（在库还是借走来） 到期时间。

2. 注意  a 0 ... *b 表示*b必须包含 0 个或者 多个 a*，在 关系型数据库中 我们使用 外建，在mongoDB中我们使用id 做联合查询.
1..*   ===> 至少一个或者多个
0..* ===> 零个或者多个
1 ==> 有且 一个

3. 按照上面的图来说他们具体的关系如下：
站在book角度，
genre 包含 一个或者多个book ，book 属于 一个 bookInstance ，book 有一个或者多个author，
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

Nice! 看起来这些东西你都准备好啦，现在让我们来实现这些对Genre的CRUD，首先我们先实现 genre ,它相对独立, 主要还是CV

*我们添加 genre 的Service Controller 和 router*

下面的内容是实现 一些空的代码结构,
我们换一个角度，在做业务中可能更加的合适 Service -> controller -> router -> 前端SPA/temple模板渲染

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

最后我们来实现book ，这个时候我们需要把它和author + genre 关联起来
> 需要使用聚合操作 来实现 关联字段的查询

实际上，我们最常用到的场景 就是 关联查询 和关联修改 这是一个难点也是重点

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

> 最后，本阶段最终代码在 -commiit -m "relation"， 本次需要讲的东西还没有讲完，我们在 POAndTesting 详细讲啦 性能优化 和 单元测试
