import React , {Component} from 'react';
import {Route,NavLink} from 'react-router-dom';
import {connect} from 'react-redux';

import classes from './Employees.module.css';
import Employee from './Employee/Employee';
import Spinner from '../../components/UI/Spinner/Spinner';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';
import * as actions from '../../store/actions/index';
import * as globalVariables from '../../globalVariables';


class Employees extends Component {
  state ={
    searchNames:null,
    showList:true,
  }

  //On mount send a request to get the employees and configuration data from the server.
  componentDidMount(){
    this.props.onGetPrerequisites();
  }

  //On unmount the employees and config data is removed form the Redux store
  componentWillUnmount(){
    this.props.onResetChangeRemove();
    this.props.onResetConfig();
  }

  //Method for searching for a specific name in the list, that changes the searchNames state property into an array with the names that fulfill the search criteria
  searchArrayHandler = (event)=> {
    let names=null;
    if(event.target.value){
      names= this.employeesArray(this.props.employees).filter((empl)=> {
        return empl.name.includes(event.target.value);
      })
    }
    
    this.setState({searchNames:names})
  }

  //Method for hide/show list
  listToggleHandler = () =>{
    this.setState((prevState)=>{
      return {
        showList: !prevState.showList,
        searchNames: null
      }
    })
  }

  //Method used to create an array with all the employees. The array contains an object for each employee that in turn contains a property for their name and userId
  employeesArray = (employees) => {
    let empls = [];
    if(employees){
      for(let empl in employees){
        empls.push({
          name: employees[empl].name.trim(),
          userId: employees[empl].userId
        })
      }
    }
    
    return empls;
  }

  //A method that dispatches an action which sets the error property for the employees reducer to null and then makes a request to retrieve the employees and config info from the server. Can only be triggered if there's an error
  errorHandler = () =>{
    this.props.onResetEmplsError();
  }
  
  render(){
    
    let myClasses = [classes.EmployeesList]

    //Due to lack of width, under 500px the employee list and employee info can't be shown at the same time
    if(window.location.pathname !== (globalVariables.subfolder + '/employees')){
      myClasses.push(classes.NoShow);
    }

    //The names variable is a sorted array that contains each employee's name and userId. If there is a value in the input search field the searchNames stat prop, that contains only empls that fulfill the search criteria, will be used instead of the array that contains all the employees info
    let names=(this.state.searchNames ? [...this.state.searchNames] : this.employeesArray(this.props.employees)).sort((el1,el2) =>{
      if(el1.name){
        return el1.name.localeCompare(el2.name)
      }else return 0;
    });

    //A list with Navlinks for each employee is rendered(or the employees that fulfill the search criteria)
    // The list will be rendered regardless of the value of showList state property if the url is '/employees'. This is done for widths under 500px where only the employee list or info can be shown and it's a fail safe in case showList is false when going to the list
    let list = this.state.showList || window.location.pathname === (globalVariables.subfolder + '/employees') ? (
    <>
      <ul className={myClasses.join(' ')}>
      {/* An input field where the user can search for a specific employee */}
        <div className={classes.Search}>
          <input 
            type="text" 
            placeholder="Search..."
            onChange={(event)=>this.searchArrayHandler(event)}/>
        </div>

      {/* A nav link is rendered for each empl, when clicked the url is changed so that the Employee comp can trigger */}
        {names.length>0 ?names.map((empl,i)=>{
          return(
          <NavLink 
            key={empl.name + i}
            to={this.props.match.url + '/' + empl.name.replace(/ /g,'_') + '/' + empl.userId }
            onClick={this.listToggleHandler}
            activeClassName={classes.active}>
              {empl.name}
          </NavLink>
          )
        }): this.props.employees ? <p>No employees found</p> :
        <p>There are no employees added at this time</p>}

      </ul>
      
    </>
    ) : null;

    //A spinner is shown for the list when the list is visible and the loading prop from the employees reducer is true
    if(this.props.loading && this.state.showList) list=<div style={{margin:'auto'}}><Spinner/></div>

    //The error handler component is rendered when the error prop from the employees reducer has a truthy value
    if(this.props.error) list =<ErrorHandler
      errorText='Unable to retrieve employee information, please try again :('
      errorMsg={this.props.error}
      btnText='Try Again'
      btnClick={this.errorHandler} btn/>

    return(
      <div className={classes.Employees}>
      
        {list}

        {/* The Employee comp is rendered at a specific path, which will be set by the navlink in the list */}
        {this.props.employees ?<Route 
          path={this.props.match.url + '/:name/:userId'}
          render={(props)=><Employee 
            noList={!this.state.showList}
            config={this.props.config}
            listToggle={this.listToggleHandler}
            {...props}/>}
          /> : null}
      </div>
    );
  };
};

const mapStateToProps = state => {
  return {
    employees: state.employees.employees,
    config: state.config.schedule_config,
    loading: state.employees.loading,
    error: state.employees.error
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onGetPrerequisites: () => dispatch(actions.getConfig('employees')),
    onResetChangeRemove: () => dispatch(actions.resetChangeRemove()),
    onResetConfig: () => dispatch(actions.resetConfig()),
    onResetEmplsError: () => dispatch(actions.resetEmplsError())
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(Employees);