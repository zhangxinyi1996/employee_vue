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
      }
    }
  }
}