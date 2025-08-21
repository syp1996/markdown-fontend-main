const { defineConfig } = require('@vue/cli-service')

module.exports = {
  transpileDependencies: [],
  devServer: {
    port: 8080,
    open: true
    // 注释掉代理配置，因为现在直接请求后端地址
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:8000',
    //     changeOrigin: true,
    //     pathRewrite: {
    //       '^/api': ''
    //     }
    //   }
    // }
  }
}
