import config from './config'
import request from '../service/request'
import api from '../service/api'

const { appid, redirectUri, prefix } = config

async function authLogin(authCBkFun) {
  const res = await request({
    method:"POST",
    url:api.signature,
    data:{
      signature_url:window.location.href
    }
  })
  if(res.status==="success"){
    const signatureInfo = res.data
    window.wx.config({
      debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
      appId: signatureInfo.signature.appId, // 必填，公众号的唯一标识
      timestamp: signatureInfo.signature.timestamp, // 必填，生成签名的时间戳
      nonceStr: signatureInfo.signature.nonceStr, // 必填，生成签名的随机串
      signature: signatureInfo.signature.signature,// 必填，签名
      jsApiList: ['onMenuShareAppMessage','onMenuShareTimeline','onMenuShareQQ','onMenuShareQZone'] // 必填，需要使用的JS接口列表
    });
  }else{  
    alert("获取signature信息失败，请稍后再试！")
    authCBkFun(false)
  }
  window.wx.ready(async function(){
    if(!/openid=/.test(window.location.search)){
      window.location.href = getWxAuthURL()
    }else{
      const open_id = URLSearchParams(window.location.search).get("openid")
      const res = await request({
        method:"GET",
        url:api.user,
        data:{
          open_id:open_id
        }
      })
      if(res.status==="success"){
        setData({
          key:"user_info",
          value:res.data
        })
        authCBkFun(open_id)
      }else{
        alert("获取用户信息失败，请稍候再试")
        authCBkFun(false)
      }
    }
  });
  window.wx.error(function(res){
    console.error("window.wx.config配置失败",res)
  });
}
function getWxAuthURL(){
  return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirectUri}&response_type=${"code"}&scope=${"snsapi_userinfo"}&state=${window.location.origin+prefix}&#wechat_redirect`
}
function URLSearchParams(url) {
  return {
    get:function(key){
      if(!url.length)return null
      var query = url.substring(1);
      var pairs = query.split("&");
      for(var i = 0;i < pairs.length; i++){
        var pos = pairs[i].indexOf("=");
        if(pos === -1) continue;
        var name = pairs[i].substring(0, pos);
        var value = pairs[i].substring(pos + 1);
        value = decodeURIComponent(value);
        if(name===key){
          return value;
        }
      }
      return null;
    }
  }
}
function setData(data) {
  window.localStorage.setItem(data.key, (typeof data.value) === "object"?JSON.stringify(data.value):data.value)
}
function getData(key) {
  let re = ""
  try {
    re = JSON.parse(window.localStorage.getItem(key))
  } catch (error) {
    re = window.localStorage.getItem(key)
  }
  return re
}
function getTranslate(node,sty){//获取transform值
  var translates=document.defaultView.getComputedStyle(node,null).transform.substring(7);
  var result = translates.match(/\(([^)]*)\)/);// 正则()内容
  var matrix=result?result[1].split(','):translates.split(',');
  if(sty==="x" || sty===undefined){
      return matrix.length>6?parseFloat(matrix[12]):parseFloat(matrix[4]);
  }else if(sty==="y"){
      return matrix.length>6?parseFloat(matrix[13]):parseFloat(matrix[5]);
  }else if(sty==="z"){
      return matrix.length>6?parseFloat(matrix[14]):0;
  }else if(sty==="rotate"){
      return matrix.length>6?getRotate([parseFloat(matrix[0]),parseFloat(matrix[1]),parseFloat(matrix[4]),parseFloat(matrix[5])]):getRotate(matrix);
  }
}
function getRotate(matrix){
  var aa=Math.round(180*Math.asin(matrix[0])/ Math.PI);
  var bb=Math.round(180*Math.acos(matrix[1])/ Math.PI);
  var cc=Math.round(180*Math.asin(matrix[2])/ Math.PI);
  var dd=Math.round(180*Math.acos(matrix[3])/ Math.PI);
  var deg=0;
  if(aa===bb||-aa===bb){
      deg=dd;
  }else if(-aa+bb===180){
      deg=180+cc;
  }else if(aa+bb===180){
      deg=360-cc||360-dd;
  }
  return deg>=360?0:deg;
}
//星球脸部痛苦表情
function ballFacePain(timeout){
  const faceElem = document.getElementById("face")
  faceElem.style.animation="unset"
  setTimeout(() => {
    faceElem.style.animation="face_change .5s infinite"
  }, timeout);
}
export default {
  authLogin,
  getWxAuthURL,
  URLSearchParams,
  setData,
  getData,
  getTranslate,
  ballFacePain,
}