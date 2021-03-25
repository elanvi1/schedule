import React from 'react';

import classes from './DrawerToggle.module.css';

const DrawerToggle = (props) => (
  // Drawer toggle shows only for widths under 720px. It is an hamburger Icon.
  <div 
  onClick={props.clicked} 
  className ={classes.DrawerToggle}>
    <div ></div>
    <div ></div>
    <div ></div>
  </div>
);

export default DrawerToggle;