import React, { Component } from 'react';
import Hammer from 'react-hammerjs'

import './index.css'

class index extends Component {
  render() {
    const { gameRule = "无" } = this.props
    return (
      <div className="rule_dialog">
        <div className="content">
          <Hammer onTap={()=>this.props.onClose()}><div className={"close_dialog"}></div></Hammer> 
          <div style={{overflowY:'auto',height:'100%',padding:"0 10vw 0"}}>
            <h3>奖励：</h3>
              <ul>
                {gameRule.split('\n').map((elem,index)=>{
                  return <li key={index}>{elem}</li>
                })}
              </ul>
            <h3>规则：</h3>
            <ul>
              <li>点击屏幕发射火箭刺向星球</li>
              <li>所有火箭发射完毕，即完成该关挑战</li>
              <li>每通过一关，火箭数量增加，星球自传速度增加</li>
              <li>任意两只火箭发生碰撞，即游戏失败</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default index;