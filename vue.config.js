const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})
module.exports = {
  devServer: {
    proxy: {
      '/img': {  // 代理 /img 开头的请求
        target: 'http://localhost:9999/employee_management',
        changeOrigin: true
      },
      // API请求核心代理（自动转发到后端正确接口地址）
      '^/api': {
        target: 'http://localhost:9999',
        changeOrigin: true,
        pathRewrite: { '^/api': '/employee_management/api' }
      },
      // 上传文件访问代理（确保上传的图片能正常显示）
      '/uploads': {
        target: 'http://localhost:9999/employee_management',
        changeOrigin: true
      }
    }
  }
}