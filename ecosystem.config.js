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
