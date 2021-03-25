import React from 'react';

import Logo from '../../Logo/Logo';
import NavigationItems from '../NavigationItems/NavigationItems';
import classes from './SideDrawer.module.css';
import Backdrop  from '../../UI/BackDrop/BackDrop'

const sideDrawer = (props) => {
  // A close class is added by default(which puts the siderawer out of view)
  let attachedClasses = [classes.SideDrawer,classes.Close];

  //A open class is added if the showSd prop is true(which is controlled by the drawerToggle). This puts the sidedrawer in view
  if (props.showSD){
    attachedClasses = [classes.SideDrawer, classes.Open];
  }

  return ( 
    <>
      {/* A backdrop is added when the sidedrawer is in view, which can be cancelled by clicking on it */}
      <Backdrop shouldShow={props.showSD} clicked={props.toggleSD}/>

      {/* The sidedrawer contains the logo and the navigation items */}
      <div className={attachedClasses.join(' ')}>
        <div className ={classes.Logo}>
          <Logo />
        </div>
        <nav>
          <NavigationItems
            toggleSD = {props.toggleSD} 
            isAuth={props.isAuth}
            isAdmin = {props.isAdmin}
            logOut={props.logOut}/>
        </nav>
      </div>
    </>
  );
};

export default sideDrawer;

