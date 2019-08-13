import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './index.css'
import { man_icon, woman_icon } from '../../assets/images'

class index extends Component {
  render() {
    const { headimgurl, nickname, sex } = this.props
    return (
      <div className={"user_info"}>
        <div className={"head_img"} style={{backgroundImage:`url(${headimgurl})`}}></div>
        <div className={"name"}>
          <img src={sex===1?man_icon:woman_icon} alt="sex" className={"sex"}/>
          <p>{nickname}</p>
        </div>
      </div>
    );
  }
}

index.propTypes = {
  headimgurl:PropTypes.string.isRequired,
  nickname:PropTypes.string.isRequired,
  sex:PropTypes.number.isRequired,
};

export default index;