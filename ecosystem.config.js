module.exports = {
  apps: [
    {
      name: "next-app",       // 应用名称
      script: "npm",           // 使用 npm 作为启动器
      args: "start",          // 运行 npm start
      cwd: "/root/star_graph", // 应用绝对路径
      instances: "max",        // 使用所有 CPU 核心
      autorestart: true,       // 崩溃自动重启
      watch: false,            // 禁用文件监视
      max_memory_restart: "1G", // 内存超限重启
      env: {
        NODE_ENV: "production",
        PORT: 3001             // 端口号（需与 next.config.js 一致）
      }
    }
  ]
};