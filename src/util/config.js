const envKey = process.env.REACT_APP_RUN_ENV;
console.log(process.env)
const envConf = {
  // 开发配置
  dev: {
    serverOrigin: "http://10.0.1.245:1111", //服务器地址
    prefix: "",
    apiPrefix: "", //接口前缀地址
    appid: "wx99b9a8e520ba5b09" //微信app_id  //云江测试号
  },
  // 内网测试环境
  "cs-in": {
    serverOrigin: window.location.origin, //服务器地址
    prefix: "/wxgame",
    apiPrefix: "", //接口前缀地址
    appid: "wx334defe775ca3fb6" //微信app_id  //黄兴测试号
  },
  // 外网测试环境
  "cs-out": {
    serverOrigin: window.location.origin, //服务器地址
    prefix: "/wxgame",
    apiPrefix: "", //接口前缀地址
    appid: "wx61c1a0601188caa3" //微信app_id   //文龙服务号
  },
  // 生产配置
  product: {
    serverOrigin: "http://10.0.1.245:1111", //服务器地址
    prefix: "/wxgame",
    apiPrefix: "", //接口前缀地址
    appid: "" //微信app_id
  }
};
const configOfEnv = envConf[envKey];
const wxProxy = "https://wx-proxy.arhieason.com";

export default {
  serverOrigin:configOfEnv.serverOrigin,
  prefix:configOfEnv.prefix,
  apiPrefix:configOfEnv.apiPrefix,
  appid:configOfEnv.appid,
  redirectUri:`${wxProxy}/proxy/redirect?callback_url=${encodeURIComponent(`${configOfEnv.serverOrigin}/weapp/wx/oauth`)}${encodeURIComponent(`&state_url=${window.location.search.replace(/\?/, "")}`)}`
}