import React from 'react';

import classes from './NavigationItems.module.css';
import NavigationItem from './NavigationItem/NavigationItem';


const navigationItems = (props) => (
  // The navigation items are shown depending on the type of user. They represent the tabs on the navigation bar.
  <ul className ={classes.NavigationItems}>
    {props.isAuth ? (
      <>
      <NavigationItem link='/' clicked={props.toggleSD}>Schedule</NavigationItem > 

      <NavigationItem link='/employees' clicked={props.toggleSD}>Employees</NavigationItem > 

      <NavigationItem link='/Account' clicked={props.toggleSD}>Account</NavigationItem > 

      {props.isAdmin ? (
        <>
        <NavigationItem link='/Schedule_Config' clicked={props.toggleSD}>Configuration</NavigationItem > 

        <NavigationItem link='/test_add' clicked={props.toggleSD}>Test Add</NavigationItem >
        </>
      ):null}
      
      </>
     ): null }

    {!props.isAuth ? <NavigationItem link='/authenticate' clicked={props.toggleSD}>Authenticate</NavigationItem> :
     <NavigationItem link='/authenticate' clicked={props.logOut}>Log Out</NavigationItem> }
  </ul>
);

export default navigationItems;