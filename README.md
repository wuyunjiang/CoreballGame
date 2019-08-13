## 效果演示
[预览gif（8.8M）](https://easy-auction-cs.oss-cn-beijing.aliyuncs.com/52b6079c151b641e20dc2df85ed42ef1.gif)

请忽略头像加载失败，因为那就是我的微信头像

在线预览：[见缝插针](https://cs.bs-advertising.arhieason.com/wxgame/)
**需要在微信中打开**

## 运行

因为项目包括前后端，需要微信授权登陆路才能进入

可以先将`/pages/home/index.js`  替换 **302** 行为`this.authCBkFun("111")`，不登录，直接回调成功函数。游戏即可运行

## 开发
在package.json中修改proxy字段值为开发环境服务器地址，可解决跨域问题

## 发布
发布时设置环境变量REACT_APP_RUN_ENV，具体值参见/util/config.js
