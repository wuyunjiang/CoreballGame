
const proxy = require('http-proxy-middleware');
 
module.exports = function (app) {
  app.use(
      proxy(
          '/huangxing/weapp/wx/signature',
          {
            target: 'http://baidu.com',
            // target: 'http://10.0.1.245:1111/',
            changeOrigin: true
          }
      )
  );
}