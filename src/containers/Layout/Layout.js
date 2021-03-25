import React, {Component} from 'react';


import classes from './Layout.module.css';
import Toolbar from '../../components/Navigation/Toolbar/Toolbar';
import SideDrawer from '../../components/Navigation/SideDrawer/SideDrawer';

class Layout extends Component{

  state = {
    showSideDrawer: false
  }
  
  //Method to put the sidedrawer on screen and show Backdrop
  sideDrawerToggleHandler = () => {
    this.setState((prevState) => {
      return {showSideDrawer: !prevState.showSideDrawer};
    });

  }
  //Method to logout and close sidedrawer, triggered by the logout Navlink
  logOutAndCloseSD = () => {
    this.sideDrawerToggleHandler();
    this.props.logOut();
  }

  render(){
    return (
        <>
        {/* Shows the main navigation items */}
        <Toolbar 
        isAuth = {this.props.isAuth}
        logOut = {this.props.logOut}
        isAdmin = {this.props.isAdmin}
        toggleSD={this.sideDrawerToggleHandler}
        />

        {/*Shows the sidedrawer for width under 720px, if toggled*/}
        <SideDrawer 
        isAuth = {this.props.isAuth}
        isAdmin = {this.props.isAdmin}
        logOut={this.logOutAndCloseSD}
        showSD={this.state.showSideDrawer}
        toggleSD={this.sideDrawerToggleHandler}/>

        {/* main will hold every component that will be rendered under the Toolbar, with a margin top */}
        <main className ={classes.Content}>
          {this.props.children}
        </main>
      </>
    )
  }
};

export default Layout;


