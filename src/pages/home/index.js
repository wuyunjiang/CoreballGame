import React, { Component } from 'react';
import Hammer from 'react-hammerjs'

import './index.css'
import util from '../../util'
import UserInfo from '../../components/userInfo'
import RuleDialog from '../../components/ruleDialog'
import config from '../../util/config'
import { logo, start_btn, rule_btn, ball, rocket_img, share_bg, 
success_bg, failed_bg, success_restart, success_rule, success_share, failed_restart, failed_rule, failed_share, } from '../../assets/images'
import request from '../../service/request'
import api from '../../service/api'
import audioManage from '../../util/audioManage'

class index extends Component {

  constructor(props){
    super(props)
    this.state = {
      visibleShare:false,
      visibleRuleDialog:false,
      visibleEndDialog:false,

      auth:false,
      gameStatus:0, //游戏状态；0未开始，1开始界面，2游戏中界面，3结束
      userInfo:{},

      scene:"",
      openId:"",
      canPlay:true,
      current_score:0,

      //游戏配置参数
      gameIsSuccess:false,//游戏是否通关
      gradeNumTip:false,//每关通过后关卡提示面板
      totalGrade:5,//总关卡
      grade:1,//当前关卡
      rotateTime:5000,//星球旋转一周所需时间 ms
      reduceRotateTime:300,//每过一关，星球旋转一圈减少的时间
      rocketCount:9,//每关需要发射的火箭数量，初始第一关为8
      shootedRockets:[],//已经发射的火箭数组,存储每只火箭插入星球的角度
      initRocket:0,// 每关星球上已有的初始火箭数
      rocketSize:14,//每只火箭占用的角度数
      rocketRunTime:150,//火箭发射到星球时间 单位ms

      //动画管理参数
      shooting:false,//火箭是否正在发射
    }
  }

  async getGameData(){
    const { open_id, scene } = this.state
    const res = await request({
      url:api.game,
      data:{
        app_id:config.appid,
        open_id:open_id,
        scene: scene || ""
      }
    })
    if(res.status==="error"){
      if(res.error_code===3201){
        window.localStorage.errorMsg = "目前不在大屏游戏时间范围内 请关注对应大屏显示"
      }else{
        window.localStorage.errorMsg = res.msg
      }
      alert(res.msg)
      this.setState({
        canPlay:false
      })
    }else{
      window.localStorage.errorMsg = ""
      this.setState({
        highest_in_history:res.data.highest_in_history,
        game_rule:res.data.game_rule,
        big_screen_id:res.data.big_screen_id,
      })
      return true
    }
  }

  /**
   * 
   * @param {bool} auth 授权是否成功
   */
  authCBkFun(open_id){
    if(open_id){
      const userInfo = util.getData("user_info")
      this.setState({
        auth:true,
        open_id:open_id,
        gameStatus:1,
        userInfo:userInfo
      })
      this.getGameData()
      this.setShare()
    }else{
      if(window.confirm("授权失败，重新授权？")){
        util.authLogin(this.authCBkFun.bind(this))
      }
    }
  }

  // 点击开始游戏
  startGame(){
    if(localStorage.errorMsg){
      alert(localStorage.errorMsg)
      return 
    }
    
    this.setState({
      gameStatus:2,
      shootedRockets:this.getNextGradeRockets(1)
    })
  }

  //向服务器发送分数
  async postScore(score){
    const { open_id, big_screen_id } = this.state
    const res = await request({
      url:api.game,
      method:"POST",
      data:{
        app_id:config.appid,
        big_screen_id:big_screen_id,
        open_id:open_id,
        score:Number(score)
      }
    })
    if(res.status==="error"){
      if(res.error_code===1400){//如果用户不存在
        console.error(res)
        alert(res.msg)
      }
    }
  }

  //游戏失败
  gameOver(current_score){
    audioManage.playFailed()
    setTimeout(()=>{
      document.getElementsByClassName("shoot_failed")[0].style.top='100vh'
      document.getElementsByClassName("shoot_failed")[0].style.left='100vw'
    },100)
    setTimeout(()=>{
      this.setState({
        gameIsSuccess:false,
        visibleEndDialog:true,
      })
    },300)
    this.postScore(current_score)
  }
  //进入下一关
  goNext(){
    let { rotateTime, rocketCount, grade, totalGrade, reduceRotateTime } = this.state
    if(grade === totalGrade){
      this.gameSuccess()//如果当前关数等于最大关数，则表示通关
    }else{
      rotateTime = rotateTime - reduceRotateTime//每过一关，星球旋转速度变快
      grade = grade + 1
      rocketCount = grade * 2 + 6 + grade
      document.getElementsByClassName("ball_box")[0].classList.add("ball_fall");
      audioManage.playPass()
      this.setState({
        gradeNumTip:true
      })
      setTimeout(()=>{
        document.getElementsByClassName("grade_num_tip")[0].innerHTML=`第 ${grade} 关` 
      },1000)
      setTimeout(()=>{
        document.getElementsByClassName("ball_box")[0].classList.remove("ball_fall");
        document.getElementById('init_rocket_rotate_style').innerHTML = ""
        this.setState({
          rotateTime:0,
          grade:grade,
          rocketCount:rocketCount,
          shootedRockets:[],
          shooting:false,
          gradeNumTip:false
        },()=>{
          setTimeout(()=>{
            this.setState({
              rotateTime:rotateTime,
              shootedRockets:this.getNextGradeRockets(grade)
            })
          },10)
        })
      },2500)
    }
  }

  // 再玩一次
  async restart(){
    if(await this.getGameData()){
      this.setState({
        rotateTime:0,
        shootedRockets:[],
      },()=>{
        this.setState({
          grade:1,
          current_score:0,
          visibleEndDialog:false,
          current_score:0,
          gameIsSuccess:false,//游戏是否通关
          gradeNumTip:false,//每关通过后关卡提示面板
          rotateTime:5000,//星球旋转一周所需时间 ms
          rocketCount:9,//每关需要发射的火箭数量，初始第一关为8
          shootedRockets:this.getNextGradeRockets(1),//已经发射的火箭数组,存储每只火箭插入星球的角度
          initRocket:0,// 每关星球上已有的初始火箭数
          shooting:false,
        })
      })
    }
  }
  
  //通关
  gameSuccess(){
    const { current_score } = this.state
    audioManage.playSuccess()
    this.setState({
      gameIsSuccess:true,
      visibleEndDialog:true,
    })
    this.postScore(current_score)
  }

  //点击底部火箭
  clickRocket(){
    //执行一次发射动画碎片
    this.setState({
      shooting:true
    })
    setTimeout(()=>{
      this.setState({
        shooting:false
      })
    },this.state.rocketRunTime)
    this.shootProcess()
  }

  //火箭的一次发射过程，包括判断是否能成功插入。设置插入角度，减少剩余火箭数
  shootProcess(){
    const { rocketRunTime, shootedRockets, current_score, highest_in_history, rocketCount } = this.state
    setTimeout(()=>{
      const angle = this.getRocketLandAngle()
      const list = JSON.parse(JSON.stringify(shootedRockets))
      if(this.rocketCanLand(list,angle)){
        audioManage.playShoot()
        list.push({
          angle:angle,
          success:true,
        })
        this.setState({
          shootedRockets:list,
          current_score:current_score + 1,
          highest_in_history:current_score + 1 > highest_in_history ? current_score + 1 : highest_in_history
        })
        if(rocketCount === list.length){
          this.goNext()
          util.ballFacePain(1000)
        }else{
          util.ballFacePain(300)
        }
      }else{
        this.gameOver(current_score)
        list.push({
          angle:angle,
          success:false,
        })
        this.setState({
          shootedRockets:list,
        })
      }
    },rocketRunTime)
  }
  // 火箭是否能够成功插入
  rocketCanLand(shootedRockets,angle){
    const { rocketSize } = this.state
    const angleMin = angle - rocketSize / 2
    const angleMax = angle + rocketSize / 2
    for (let i = 0; i < shootedRockets.length; i++) {
      const element = shootedRockets[i];
      const elementMin = element.angle - rocketSize / 2
      const elementMax = element.angle + rocketSize / 2
      if(angleMin < elementMax && angleMin >= elementMin){
        return false
      }
      if(angleMax > elementMin && angleMax <= elementMax){
        return false
      }
    }
    return true
  }
  //获取火箭插入角度时
  getRocketLandAngle(){
    const ballEle = document.getElementById("ball")
    return util.getTranslate(ballEle,"rotate")
  }

  componentDidMount(){
    //授权
    util.authLogin(this.authCBkFun.bind(this))
    const scene = util.URLSearchParams(window.location.search).get("scene")
    this.setState({
      scene:scene
    })
  }

  /**
   * 创建已经在球上的火箭
   */ 
  getNextGradeRockets(grade){
    let list = []
    while(grade !== list.length){
      const angle = Math.floor(Math.random()*360)
      if(this.rocketCanLand(list,angle)){
        list.push({
          angle:angle,
          success:true,
          isInit:true
        })
      }else{
        continue;
      }
    }
    return list
  }

  //设置带分数的分享
  setScoreShare(score){
    this.setState({
      visibleShare:true
    })
    this.setShare(score)
  }
  //关闭带分数的分享
  closeScoreShare(){
    this.setState({
      visibleShare:false
    })
    this.setShare()
  }
  // 设置分享
  setShare(score = ""){
    const { big_screen_id, open_id } = this.state
    const scene = util.URLSearchParams(window.location.search).get("scene")
    const shareInfo = {
      title: `见缝插针${score===""?"":`，我得了${score}分`}`,// 分享标题
      desc: score===""?'快来玩玩易讯AR大屏互动小游戏，还有奖品拿哦':"快来玩玩易讯AR大屏互动小游戏，超过我就有奖品拿哦", // 分享描述
      link: window.location.origin + window.location.pathname + (scene!==null ? `?scene=${scene}` : ""),
      imgUrl: 'https://easy-auction-cs.oss-cn-beijing.aliyuncs.com/04afc99f87f68e5e69d1a92e286a8b6d.png', // 分享图标
      success: (res) => {
        if(/ok/.test(res.errMsg)){
          this.shareCbk(big_screen_id,open_id)
        }
      }
    }
    window.wx.ready(()=>{
      window.wx.onMenuShareAppMessage(shareInfo)
      window.wx.onMenuShareTimeline(shareInfo)
      window.wx.onMenuShareQQ(shareInfo)
      window.wx.onMenuShareQZone(shareInfo)
    })
  }
  // 分享回调
  shareCbk(bigScreenId,openId){
    request({
      url: api.share,
      method: "POST",
      data:{
        app_id:config.appid,
        big_screen_id:bigScreenId,
        open_id:openId,
      }
    })
  }

  render() {
    const { auth, gameStatus, userInfo, visibleRuleDialog, game_rule, highest_in_history, current_score, visibleEndDialog, 
      visibleShare, gameIsSuccess, gradeNumTip, rotateTime, rocketCount, shootedRockets, shooting, rocketRunTime } = this.state
    return (
      <div className={"normal"}>

        {/* 是否登录 */}
        {!auth?<div className={"no_auth"}>
          <h2>授权登录成功后<br/>才能参与游戏</h2>
        </div>:""}

        {/* 开始界面 */}
        {auth&&gameStatus===1?<div className={"start"}>
          <div className="user_box">
            <UserInfo {...userInfo}/>
          </div>
          <div className={"game_content"}>
            <img className="logo" src={logo} alt=""/>
            <div className="btn_group">
              <Hammer onTap={()=>this.startGame()}><img src={start_btn} alt=""/></Hammer>
              <Hammer onTap={()=>this.setState({visibleRuleDialog:true})}><img src={rule_btn} alt=""/></Hammer>
            </div>
          </div>
        </div>:""}

        {/* 游戏界面 */}
        {auth&&gameStatus===2?<div className={"starting"}>
          <div className="user_box">
            <UserInfo {...userInfo}/>
            <div className="record_high">
              <p>今日最高</p>
              <p className="score">{highest_in_history}</p>
            </div>
            <div className="current_score" >
              <p>当前得分：</p>
              <p className="score">{current_score}</p>
            </div>
          </div>
          <div className={"ball_box"}>
            {rotateTime?<img id="ball" src={ball} alt="星球" style={{animation:`ball_rotate ${rotateTime/1000}s infinite linear`}}/>:""}
            {shootedRockets.map((elem,index)=>{
              if(elem.isInit){
                const runkeyframes =` @keyframes init_rocket_rotate${index}{
                  0%{
                    transform:translateZ(0) rotate(${360-elem.angle}deg)
                  }
                  100%{
                    transform:translateZ(0) rotate(${720-elem.angle}deg)
                  }
                }`
                const s = document.getElementById('init_rocket_rotate_style')
                s.innerHTML += runkeyframes
              }
              return <div key={index} className={elem.success?"rocket_on_ball":"shoot_failed"} 
                style={elem.success
                  ?(elem.isInit
                    ?{transform:`translateZ(0) rotate(${360-elem.angle}deg)`,animation:`init_rocket_rotate${index} ${rotateTime/1000}s infinite linear`}
                    :{transform:`translateZ(0) rotate(0deg)`,animation:`rocket_rotate ${rotateTime/1000}s infinite linear`})
                  :{}}></div>
            })}
            <div id="face" className={"face"}></div>
          </div>
          <div className={"monster"}></div>
          <div className={"aliens_gif"}></div>
          <div className="surplus_rocket">
            <img src={rocket_img} alt="rocket"/>
            <span style={{fontWeight: 100}}>X</span>
            <span>{rocketCount-shootedRockets.length}</span>
          </div>
          {rocketCount-shootedRockets.length 
            ?<Hammer onTap={shooting?()=>{}:()=>this.clickRocket()}>
              <div 
                style={shooting?{animation:`rocket_shooting ${rocketRunTime/1000}s linear`}:{}}
                className={"click_rocket"} ></div>
            </Hammer>
            :""
          }
          {gradeNumTip?<div className="grade_num_tip"></div>:""}
        </div>:""}

        {/* 游戏结束/通关 */}
        {visibleEndDialog?<div className={"game_end"}>
          <div className="score_info_box">
            <img src={gameIsSuccess?success_bg:failed_bg} alt=""/>
            <div className={"score_info"}>
              <p className="best">今日最高：{highest_in_history}</p>
              <p className="score" style={{color:`${gameIsSuccess?"#FFC600":"#00DEFF"}`}}>{current_score}</p>
            </div>
          </div>
          <div className="menu_btn">
            <Hammer onTap={()=>this.restart()}><img src={gameIsSuccess?success_restart:failed_restart} alt=""/></Hammer>
            <Hammer onTap={()=>this.setState({visibleRuleDialog:true})}><img src={gameIsSuccess?success_rule:failed_rule} alt=""/></Hammer>
            <Hammer onTap={()=>this.setScoreShare(current_score)}><img src={gameIsSuccess?success_share:failed_share} alt=""/></Hammer>
          </div>
        </div>:""}

        {visibleRuleDialog?<RuleDialog gameRule={game_rule} onClose={()=>this.setState({visibleRuleDialog:false})}/>:""}
        {visibleShare?<div className="share_box">
          <img src={share_bg} alt=""/>
          <Hammer onTap={()=>this.closeScoreShare()}><div>关闭</div></Hammer>
        </div>:""}
      </div>
    );
  }
}

export default index;