import React from 'react';

import classes from './Toolbar.module.css';
import Logo from '../../Logo/Logo';
import NavigationItems from '../NavigationItems/NavigationItems';
import DrawerToggle from '../SideDrawer/DrawerToggle/DrawerToggle';

//Toolbar holds a drawerToggle which will only show under 720px. Over 720px it will show the Logo and the navigation items

const toolbar = (props) => (
  <header className ={classes.Toolbar}>
    <DrawerToggle clicked={props.toggleSD}/>
    <div className={classes.Logo}>
      <Logo />
    </div>
    <nav className = {classes.DesktopOnly}>
      <NavigationItems 
        isAuth={props.isAuth}
        logOut={props.logOut}
        isAdmin={props.isAdmin}/>
    </nav>
  </header>
);

export default toolbar;