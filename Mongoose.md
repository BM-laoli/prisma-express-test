# 说明

> 这里的文档 是说明 Express + Mongoose 的各种 使用，参考文档 官方6.3 英文文档 和 CSDN的这片文章 <https://blog.csdn.net/weixin_45828332/article/details/114120710>
<https://blog.csdn.net/weixin_45828332/article/details/114119058>

## 概念

> 如果你需要玩 MongoDB 有些概念 你一定需要知道 就像你玩Mysql 你需要知道SQL 、tab、一对一、一对多 、外建、关系 等....

首先我们建立一个认知 **Schema生成Model，Model创造Document**
以下是详细说明：

Schema（模式对象） ——Schema 对象定义约束了数据库中的文档结构
Model ——Model 对象作为集合中的所有文档的表示，相当于MongoDB中的collection，它的每一个实例就是一个document文档
Document ——Document表示集合中的具体文档，相当于collection中的一个具体文档

## Schema

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

## Model

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

## 连接MongoDB

> 第一步！先连接上数据库再说！
<https://developer.mozilla.org/zh-CN/docs/Learn/Server-side/Express_Nodejs/mongoose>

```js

```

## 创建create

## 查询query

## 更新和删除update 和delete

## 关于关联操作我想说的

> 需要使用聚合操作 来实现 关联字段的查询
<https://www.cnblogs.com/showtime813/p/4564157.html>
