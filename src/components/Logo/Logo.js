import React from 'react';

import scheduleLogo from '../../assets/images/schedule.png';
import classes from './Logo.module.css'

const logo = (props) => (
  // Component that holds the logo
  <div className ={classes.Logo} >
    <img src={scheduleLogo} alt="ScheduleLogo"/>
  </div>
);

export default logo;