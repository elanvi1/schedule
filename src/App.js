import React,{Component} from 'react';
import {Route,Redirect,Switch} from 'react-router-dom';
import {connect} from 'react-redux';
import asyncComponent from './hoc/asyncComponent/asyncComponent';

import Layout from './containers/Layout/Layout';
import Auth from './containers/Authenticate/Authenticate';
import Schedule from './containers/Schedule/Schedule';
import * as actions from './store/actions/index';

// The components are imported async when used in order to ease the process by not downloading components the user might not use
const asyncEmployees = asyncComponent(() => import('./containers/Employees/Employees'));
const asyncTestAdd = asyncComponent(() => import('./containers/TestAdd/TestAdd'));
const asyncScheduleConfig = asyncComponent(() => import('./containers/ScheduleConfig/ScheduleConfig'));
const asyncAccount = asyncComponent(() => import('./containers/Account/Account'));

class App extends Component {
  componentDidMount(){
    // Everytime the app mounts a function will execute that checks if the current user is logged in by using the token and expiration time stored in local storage
    this.props.onCheckAuth();
  }
  render(){
    // Create a guard in order to protect certain routes depending on the type of user: authenticated, unauth, admin, not admin.
    let switchBlock = this.props.isAuth ? this.props.isAdmin ?(
      <Switch>
        <Route path='/' exact component={Schedule}/>
        <Route path='/employees' component={asyncEmployees}/>
        <Route path='/Account' component={asyncAccount}/>
        <Route path='/Schedule_Config' component={asyncScheduleConfig}/>
        <Route path='/test_add' component={asyncTestAdd}/>
        <Route path='/authenticate' component={Auth}/>
        <Redirect to={'/'}/>
      </Switch>
    ) :(
      <Switch>
        <Route path='/' exact component={Schedule}/>
        <Route path='/employees' component={asyncEmployees}/>
        <Route path='/Account' component={asyncAccount}/>
        <Route path='/authenticate' component={Auth}/>
        <Redirect to={'/'}/>
      </Switch>
    ): (
    <Switch>
      <Route path='/authenticate' component={Auth}/>
      <Redirect to={'/authenticate'}/>
    </Switch>
    );

    // The switch block is placed inside the layout. The layout holds the toolbar and sidedrawer
    return (
      <div >
        <Layout isAuth={this.props.isAuth} logOut={this.props.onLogOut} isAdmin={this.props.isAdmin}>
          {switchBlock}
        </Layout>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    isAuth: state.auth.token !=='',
    isAdmin: state.auth.admin ==='true' || state.auth.admin === true
  };
};

const mapDispatchToProps = dispatch => {
  return{
    onLogOut: () => dispatch(actions.logout()),
    onCheckAuth: () => dispatch(actions.authCheckState())
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(App);
