const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');

module.exports = defineConfig({
  transpileDependencies: true,

  devServer: {
    port: 8080,
    host: '0.0.0.0',
    hot: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*"
    },
    proxy: {
      '/api': {
        target: 'http://backend:3000',  // Usando o nome do serviço do backend no Docker
        changeOrigin: true,
        ws: true // Permitir WebSockets
      }
    }
  },

  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
      })
    ]
  }
});
