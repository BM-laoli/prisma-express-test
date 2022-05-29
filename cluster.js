const cluster = require('cluster');
const os = require('os');

/* 判断如果是主线程那么就启动三个子线程 */
if (cluster.isMaster) {
  console.log('主进程');
  /* 多少个cpu启动多少个子进程 */
  for (let i = 0; i < os.cpus().length; i++) cluster.fork();
} else {
  /* 如果是子进程就去加载启动文件 */
  console.log('子进程');
  require('./master.js');
}
