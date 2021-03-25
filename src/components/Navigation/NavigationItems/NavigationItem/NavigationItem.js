import React from 'react';

import classes from './NavigationItem.module.css';
import {NavLink} from 'react-router-dom';

const navigationItem = (props) => {
  // Each navigation item receives a link that changes the url and triggers a new component to mount
  // The on click attribute is only used for the sidedrawer in order to close it
    return (
    <li className = {classes.NavigationItem}>
      <NavLink 
        to={props.link} 
        exact={props.link==='/' ? true: false}
        onClick={props.clicked}
        activeClassName = {classes.active}>
        {props.children}
      </NavLink>
    </li>
    )
};

export default navigationItem;