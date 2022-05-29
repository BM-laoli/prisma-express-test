> 这里主要讲两个方面的内容 **性能优化** **单元测试**

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

> 压力测试/和多线程调优 - 打造一个持续且健壮的程序., 这一讲我们将深入了机和立即Nodejs 的压力测试 ，稳定性的实现原理和逻辑，这里我参考的文章是：<https://juejin.cn/post/7095354780079357966>

#### 还原项目结构

> 我们需要还原上一个分支的内容，比如PM2 配置的内容，因为在这一讲，重点是性能 和测试，所以我们不实用一些pm2 之类的东西，我们就看Node底层的运作逻辑

  现在我们需要这几件事情哈

  1. 删除文件 ecosystem.config.js
  2. 还原script 配置
  3. 为了 让我们的项目更加的简洁合理，我们把公用的方法丢到utils中, 把db 的配置做好啦，把log 的方法抽离到啦utils中

#### 整改项目 并且清出 我们的压测 工具

> 我们这种写规模的API，在性能上不会有什么大的差距，为了体现这种差距，我们新建一个test.js 来测试它的代码如下

  我们去做一些基础的代码准备工作

```js
const fs = require('fs')
const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.end('hello world')
})

app.get('/index', (req, res) => {
  const file = fs.readFileSync(__dirname + '/index.html', 'utf-8') // 永远遵循Node 是原则 不要去写同步的线程堵塞的代码
  /* return buffer */
  res.end(file)
  /* return stream 这种方式更加好用 和 常用 通常做SSR 和 返回文件的时候都用这个 */  
  // fs.createReadStream(__dirname + '/index.html').pipe(res)
})

app.listen(3000)
```

介绍一下 压测工具 ab 文档在这 <https://www.tutorialspoint.com/apache_bench/apache_bench_quick_guide.htm> ，由于为的电脑是MAC 所以自带的有这个工具，下面是常用的命令参数
> 压测只是一种手段，为了就是看看服务器的抗压能力, 然后我们需要通过各种手段找出 性能未达标的原因，以及想办法优化他

参数 解释
-c concurrency 设定并发数，默认并发数是 1
-n requests 设定压测的请求总数
-t timelimit 设定压测的时长，单位是秒
-p POST-file 设定 POST 文件路径，注意设定匹配的 -T 参数
-T content-type 设定 POST/PUT 的数据格式，默认为 text/plain
-V 查看版本信息
-w 以Html表格形式输出

我们来试一下:" 对上面的index 接口，每秒请求200个，总次数1600次 "

```shell
ab -c200 -n1600 http://127.0.0.1:3000/index
```  

运行完成后会输出很多参数，我们主要关注的是 下面这几个指标。尤其是最后四个

```md
Complete requests:      1600 # 请求完成成功数 这里判断的依据是返回码为200代表成功
Failed requests:        0 # 请求完成失败数
Total transferred:      8142400 bytes # 本次测试传输的总数据
HTML transferred:       7985600 bytes

Requests per second:    2188.47 [#/sec] (mean) # QPS 每秒能够处理的并发量
Time per request:       91.388 [ms] (mean) # 每次请求花费的平均时常
Time per request:       0.457 [ms]  # 多久一个并发可以得到结果
Transfer rate:          10876.09 [Kbytes/sec] received # 吞吐量 每秒服务器可以接受多少数据传输量
```

指标有来然后呢？ 针对性的解决问题，首先我们 来看，硬件层面的：如果这里的吞吐量刚好是我们服务器的网卡带宽一样高，说明瓶颈来自于我们的带宽，而不是来自于其他例如cpu,内存，硬盘等等，那么我们其他的如何查看呢，我们可以借助这两个命令

```shell
top 监控计算机cpu和内存使用情况
iostat 检测io设备的带宽的
```

**硬件问题**
> 我们就可以在使用ab压测的过程中实时查看服务器的状态，看看瓶颈来自于「cpu」、「内存」、「带宽」等等对症下药。当然存在一种特殊情况，很多场景下「NodeJs」只是作为「BFF」这个时候假如我们的「Node」层能处理600的「qps」但是后端只支持300，那么这个时候的瓶颈来自于后端。

**软件问题**
> 主要是指你的代码写的太烂了，拖垮了机器，那么什么样才算好代码？标准是什么？指标是什么？

我们看看使用什么工具来分析Node 的性能，我们都知道Node的基础是V8 ，那么我们可以用 chrome devtools 来采集这些性能数据，如果你觉得不够严谨可以使用node 自带的性能分析工具但是它很麻烦，而且数据不直观(所以我们不讲哈) 。 他们的操作分别如下

- --prof

```shell
node   --prof  test.js
# 它会生成一些性能分析文件.log 我们使用另一个命令解析它
ab -c50 -t5 http://127.0.0.1:3000/index

node --prof-process isolate-0x104a0a000-25750-v8.log > profile.txt

# 这样在这个文件里就会有非常详细的性能记录，js c++ gc 掉用栈信息 都有

```

- 使用chrome devtools
  首先我们上使用下面命令挂上devtoos

```shell
node --inspect-brk test.js 
```

  然后我们前往这个地址 chrome://inspect/ ，找到自己的Remote Target 点击 inspect 进去，你就发现这个和你调试前端的时候大同小异，这里你可以记录性能还可以看火焰图，还是
  比较直观和简单的.然后你就能找问题的本质，然后一个一个的处理这些 性能问题，如果是原创机器 使用ip连接就好啦，当然你可以试试这个工具 *clinic* 去调试远程服务器。

  ![](https://cdn.nlark.com/yuque/0/2022/png/1627571/1653755618621-5324e4d4-80d7-4a6b-8319-596d4effcff5.png?x-oss-process=image%2Fresize%2Cw_1498%2Climit_0)

通过分析我们发现，这个掉用栈耗时14% 太高啦 ，然后是找到掉用方法，我们把它放到
外面掉用，启动的时候缓存起来，而不是每次都去读取文件

```js
const fs = require('fs');
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.end('hello world');
});

// 我们改成启动的时候读取 而不是每次请求读取，约等于做啦一次缓存
// 在Nodejs中 底层是基于C++的，虽然我们后去的utf-8，c++底层识别到的是buffer 而且这个readFileSync，默认的buffer，如果我们去掉utf-8会更快
const file = fs.readFileSync(__dirname + '/index.html', 'utf-8');
app.get('/index', (req, res) => {
  /* return buffer */
  res.end(file);
  /* return stream */
  // fs.createReadStream(__dirname + '/index.html').pipe(res)
});

app.listen(3000);

```

![](https://cdn.nlark.com/yuque/0/2022/png/1627571/1653755466182-fb629d7d-f83d-4655-9266-c8b24891d7b4.png?x-oss-process=image%2Fresize%2Cw_1324%2Climit_0)

再跑一下ab 现在好多啦。所以我们 得出一条结论
*减少不必要的计算，我们可以缓存因为计算都要吃CPU的在并发的时候就会有瓶颈，做缓存就是一种空间换时间的方式*

关于内存的优化，最重要的事情就是防止内存溢出 ，v8Gc 分两类 ,在devtools中有内存分析的工具

- 新生代：容量小、垃圾回收更快
- 老生代：容量大，垃圾回收更慢

> 想要优化，我们就要了解其底层原理，在Nodejs的buffer分配策略是这样的：“分两种情况<8kb 的时候，Node会先创一个8kb空间，然后计算buffer占用大小，然后从创建的8k中切一点出来用，依次新增”， 依据这样类似于池的概念，我们也可以这样去优化

**关于多进程**
> 上面我们说了 很多 硬件 + 软件 优化，现在我们来看看更加底层的优化

现在的计算机一般呢都搭载了多核的cpu，我们可以利用「多进程」或者「多线程」来尽量利用这些多核cpu来提高我们的性能。

进程：拥有系统挂载运行程序的单元 拥有一些独立的资源，比如内存空间
线程：进行运算调度的单元 进程内的线程共享进程内的资源 一个进程是可以拥有多个线程的

在Nodejs中 ，主进程在运行V8和JS，它是老板。在通过事件循环，LiibUv 由 四个字进程去工作。虽然JS是单线程的，但是我们可以通过Node提供的API 在其他CPU再跑一个JS环境，来充分利用多线程提升程序的性能。我们来尝试一下

1. 我们先删除原来的test.js
2.然后呢 新建master & child 分别写入下面的内容

```js
// master
/* 自带的子进程模块 */
const cp = require('child_process')
/* fork一个地址就是启动了一个子进程 */
const child_process = cp.fork(__dirname + '/child.js') 
// 基本上和浏览器的work 一样 每次fork 启动一个字线程，但是我们推荐 启动的字线程个数在 os.cpus().length / 2 比较合适
/* 通过send方法给子进程发送消息 */
child_process.send('主进程发这个消息给子进程')
/* 通过 on message响应接收到子进程的消息 */
child_process.on('message', (str) => {
  console.log('主进程：接收到来自自进程的消息', str);
})


// children
/* 通过on message 响应父进程传递的消息 */
process.on('message', (str) => {
  console.log('子进程， 收到消息', str)
  /* process是全局变量 通过send发送给父进程 */
  process.send('子进程发给主进程的消息')
})
```

上面就上小打小闹的demo. 现在我们来介绍一个更加强大的线程管理 lib cluster，pm2就是基于它实现的线程管理,。具体说一下它的应用场景，我们想一下这样一种服务架构
"如果我们可以在不同的核分别去跑一个「http服务」那么是不是类似于我们后端的集群，部署多套服务呢，当客户端发送一个「Http请求」的时候进入到我们的「master node」，当我们收到请求的时候，我们把其请求发送给子进程，让子进程自己处理完之后返回给我，由主进程将其发送回去", 使用 cluster lib 就能很简单的实现

 我们删除前面的两个mater 和 children 文件新建app2.js cluster.js, 分别写入如下的内容

```js
// mater.js 正常的额启动文件
const fs = require('fs');
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.end('hello world');
});

// 我们改成启动的时候读取 而不是每次请求读取，约等于做啦一次缓存
const file = fs.readFileSync(__dirname + '/index.html', 'utf-8');
app.get('/index', (req, res) => {
  res.end(file);
});

app.listen(3000);

// cluster
const cluster = require('cluster')
const os = require('os')

/* 判断如果是主线程那么就启动三个子线程 */
if(cluster.isMaster){
  /* 多少个cpu启动多少个子进程 */
  for (let i = 0; i < os.cpus().length; i++) cluster.fork()
} else {
  /* 如果是子进程就去加载启动文件 */
  require('./mater.js')
}
```

这个时候我们再去用ab 压测你会发现 性能的提升还是很大的，上面的操作呢，实际上就是用cpu 模拟了一下 负载均衡

**优雅重启**
> 还记得上面的优化中我们有提到一个点 ：“在程序死掉的时候自动重启，同时不影响其服务”，这就是 优雅的重启，我们看看如果我们不实用pm2 如何实现, 对此我们方案也非常的简单，“心跳检测，杀掉僵尸进程”
主要需要做的工做如下
1.主线程每隔五秒发送一个心跳包ping，同时记录上发送次数+1，时间根据自己而定 这里五秒是测试方便
2.子线程接收到了ping信号回复一个pong
3.主线程接收到了子线程响应让计算数-1
4.如果大于五次都还没响应可能是假死了，那么退出线程并清空定时器，

只需要改造一下 clusterjs就好

```js
const cluster = require('cluster')
const os = require('os')

/* 判断如果是主线程那么就启动三个子线程 */
if(cluster.isMaster){
  /* 多少个cpu启动多少个子进程 */
  for (let i = 0; i < os.cpus().length; i++) {
    let timer = null;
    /* 记录每一个woker */
    const worker = cluster.fork()

    /* 记录心跳次数 */
    let missedPing = 0;

    /* 每五秒发送一个心跳包 并记录次数加1 */
    timer = setInterval(() => {
      missedPing++
      worker.send('ping')

      /* 如果大于5次都没有得到响应说明可能挂掉了就退出 并清楚定时器 */
      if(missedPing > 5 ){
        process.kill(worker.process.pid)
        worker.send('ping')
        clearInterval(timer)
      }
    }, 5000);

    /* 如果接收到心跳响应就让记录值-1回去 */
    worker.on('message', (msg) => {
      msg === 'pong' && missedPing--
    })
  }

  /* 如果有线程退出了，我们重启一个 */
  cluster.on('exit', () => {
    cluster.fork()
  })
} else {
  /* 如果是子进程就去加载启动文件 */
  require('./index.js')

  /* 心跳回应 */
  process.on('message', (msg) => {
    msg === 'ping' && process.send('pong')
  })

  process.on('uncaughtException', (err) => {
    console.error(err)
    /* 进程错误上报 */
    /* 如果程序内存大于xxxm了让其退出 */
    if(process.memoryUsage().rss > 734003200){
      console.log('大于700m了，退出程序吧');
      process.exit(1)
    }
    /* 退出程序 */
    process.exit(1)
  })
}
```

总结一下 上面就是如何做优化的内容啦

## 单元测试
