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

### 构造参数

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

### 方法说明

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

### 创建create

### 查询query

### 更新和删除update 和delete

## 关于关联操作我想说的

> 需要使用聚合操作 来实现 关联字段的查询
<https://www.cnblogs.com/showtime813/p/4564157.html>
