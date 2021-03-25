import React,{Component} from 'react';
import {connect} from 'react-redux';
import {Route} from 'react-router-dom';
import asyncComponent from '../../../hoc/asyncComponent/asyncComponent';

import classes from './Employee.module.css';
import Button from '../../../components/UI/Button/Button';
import Modal from '../../../components/UI/Modal/Modal';
import EmployeeInfo from '../../../components/EmployeeInfo/EmployeeInfo';
import Spinner from '../../../components/UI/Spinner/Spinner';
import ErrorHandler from '../../../components/ErrorHandler/ErrorHandler';
import * as actions from '../../../store/actions/index';
import * as globalVariables from '../../../globalVariables';

// Import empl schedule async, when used
const AsyncEmployeeSchedule = asyncComponent(() => import('../../../components/EmployeeSchedule/EmployeeSchedule'))

//Employee comp works on the same principle as Account the differences are:
// 1) There is no password element.
// 2) Elements can be edited only by admin user.
// 3) A user can be removed.
// 4) Preferences can only be shown not eddited.

class Employee extends Component{
  // The state contains among other the necessary info to render input elements necessary for changing empl info
  state = {
    info:{
      name: {
        elemType:'input',
        elemConfig: {
          type:'text',
          placeholder:'Name',
          name:'name',
          id:'name'
        },
        warning:'At least 1 character required',
        label:'Name:',
        value:'',
        validation:{
          required:true
        },
        valid:false,
        changed: false
      },
      project:{
        elemType:'input',
        elemConfig: {
          type:'text',
          placeholder:'Project Name',
          name:'project',
          id:'project'
        },
        warning:'At least 1 character required',
        label:'Project:',
        value:'',
        validation:{
          required:true
        },
        valid:false,
        changed: false
      },
      address:{
        elemType:'input',
        elemConfig: {
          type:'text',
          placeholder:'Address',
          name:'address',
          id:'address'
        },
        warning:'At least 1 character required',
        label:'Address:',
        value:'',
        validation:{
          required:true
        },
        valid:false,
        changed:false
      },
      email:{
        elemType:'input',
        elemConfig: {
          type:'email',
          placeholder:'E-mail',
          name:'email',
          id:'email'
        },
        warning:'Needs to have format ...@...[.]...',
        label:'E-mail:',
        value:'',
        validation:{
          required:true,
          isEmail: true,
        },
        valid:false,
        changed:false
      }
    },
    showModal: false,
    width: window.innerWidth,
    employee:null,
    edit: {
      name: false,
      email: false,
      address:false,
      project:false
    },
    showPrefs:false
  }

  // When the component mounts an event listener is added, with the help of which the width is registered in the state
  // The state employee object is also set here, by identifying the user based on the userId which is taken from the routing params. It contains the info on which the content will be rendered
  componentDidMount(){
    window.addEventListener('resize',this.updateWidthOnResize);
    for(let empl in this.props.employees){
      if(this.props.employees[empl].userId === this.props.match.params.userId){
        this.setState({employee:this.props.employees[empl]});
      };
    };
  };

  //A check is made to not update the state if there is an error and it's the same employee
  shouldComponentUpdate(nextProps, nextState){
    if(this.props.match.params.userId === nextProps.match.params.userId && this.props.error){
      return false;
    }else{
      return true;
    }
  }

  componentDidUpdate(prevProps,prevState){
    
    //A check is done so that the employee info is updated only if there is a change in the employees prop from the employees reducer for the user that matches the userId in the url
    for(let empl in this.props.employees){
      if(this.props.employees[empl].userId  === this.props.match.params.userId && JSON.stringify(this.props.employees[empl]) !== JSON.stringify(this.state.employee)){
        this.setState({employee:this.props.employees[empl]});
      }else if(prevProps.employees){
        if(prevProps.employees[empl].name === this.props.match.params.name.replace(/_/g,' ') && this.props.employees[empl].userId ===this.props.match.params.userId &&JSON.stringify(this.props.employees[empl]) !== JSON.stringify(this.state.employee)){
          this.props.history.push(`/employees/${this.props.employees[empl].name.replace(/ /g,'_')}/${this.props.employees[empl].userId}`)
          this.setState({employee:this.props.employees[empl]});
        }
      }
    };
    
    //The employee info is removed if an employee is deleted
    if(prevProps.employees && this.props.employees){
      if(Object.keys(this.props.employees).length !== Object.keys(prevProps.employees).length){
        for(let empl in prevProps.employees){
          if(prevProps.employees[empl].userId === this.props.match.params.userId && !this.props.employees[empl]){
            this.setState({employee:null})
          }
        }
      }
    }

    //If the url changes to point to another user the ther error prop is set to null
    if(this.props.error){
      this.props.onResetChangeRemove();
    }
  };

  componentWillUnmount(){
    window.removeEventListener('resize',this.updateWidthOnResize);
  }

  //Method used in cojuction with an event listener added when the component mounts in order to keep track of the width
  updateWidthOnResize =() => {
    this.setState({width:window.innerWidth})
  }

  //Toggle to show the empl preferences or not
  toggleShowPrefs = () => {
    this.setState(prevState =>{
      return{showPrefs:!prevState.showPrefs}
    })
  }

  //Each time the user wants to change certain empl info, the info for that input field is reset and the input field is shown/hidden
  toggleEditHandler = (type) =>{
   
    this.setState((prevState)=>{
      return {edit: {
        ...prevState.edit,
        [type]: !prevState.edit[type]
        },
        info:{
          ...this.state.info,
          [type]:{
            ...this.state.info[type],
            value:'',
            valid:false,
            changed:false
          }
        }
      }
    })
  }

  //A toggle to show or hide the modal for removing an empl
  removeEmployeeHandler = () => {
    this.setState((prevState)=>{
      return {showModal: !prevState.showModal}
    })
  }

  acceptRemoveHandler = () => {
    this.removeEmployeeHandler();

    //Whenever removing an employee, the list is shown if it wasn't before or if width under 500px
    if(!this.props.error){
      if(this.state.width > 500){
        if(this.props.noList){
          this.props.listToggle();
        }
      }else{
        this.goToList();
      }
    }
    
    //Action is dispatched to remove the user and userInfo from the database
    this.props.onRemove(this.state.employee.identifier);
  }

  goToList = () => {
    this.props.history.push('/employees');
  }

  //Method used for the onChange event of an input field, it copies the value entered by the user into the state and checks if that value is valid.
  changeInputHandler = (event, elemIdentifier) => {

    const updatedInfo ={
      ...this.state.info,
      [elemIdentifier]:{
        ...this.state.info[elemIdentifier],
        value: event.target.value,
        valid: this.validationHandler(this.state.info[elemIdentifier].validation, event.target.value),
        changed: true
      }
    }

    this.setState({info:updatedInfo});
  }

  //A set of rules to check if the value entered by the user is valid
  validationHandler(rules,value) {
    let isValid = true;

    if (!rules) {
        return true;
    }
    
    if (rules.required) {
        isValid = value.trim() !== '' && isValid;
    }
    
    if (rules.isEmail) {
        const pattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        isValid = pattern.test(value) && isValid;
    }

    return isValid;
}

  
  saveChangeHandler = (identifier, name,value) => {
    //Dispatches and action that updates user info on the server
    this.props.onChange(identifier,name,value)
   
    this.toggleEditHandler(name);
  }

  //Dispatches an action that sets the value of error from the changeRemove reducer to null and fetches the empls and config info from the server
  errorHandler = () =>{
    this.props.onResetEmplError();
  }
  

  render(){
    
    //Add a class to change width to 100% if there is no List shown
    let myClasses = [classes.Employee];

    if (this.props.noList){
      myClasses.push(classes.NoList);
    }

    // We first show the employee info as simple text and then change to input fields when the eddit button is clicked(changing the value of this.state.editView)
    let info = <EmployeeInfo 
      info={this.state.info}
      employee={this.state.employee}
      edit={this.state.edit}
      toggleEdit={this.toggleEditHandler}
      changeInput={this.changeInputHandler}
      save={this.saveChangeHandler}
      admin={this.props.isAdmin}/>

    // The preference info is shown only if user is admin
    let prefs=null;

    if(this.state.employee && this.props.isAdmin){
      
      prefs=(
        <>
        <div className={classes.Prefs}>
         <strong>Preferences : </strong>
         <Button 
          btnType='Small Primary'
          clicked={this.state.employee.preferences ?this.toggleShowPrefs:null}>
            {this.state.employee.preferences ? this.state.showPrefs?'[hide]':'[show]':'[empty]'}</Button>
        </div>
        {this.state.showPrefs ? this.state.employee.preferences.map((el,i)=>{
            return i!==0 ?<div className={classes.Pref}><strong>{i}. </strong>{el}</div> : null
        }):null}
        </>
      )
    }

    //Block with button that changes url to the empl schedule(if any)
    let emplSchedule = null;
    if(this.state.employee){
      emplSchedule= (
        <div className={classes.Prefs}><strong>Schedule : </strong>   {this.state.employee.schedule ? (
          <Button 
            btnType='Small Primary'
            clicked = {() => this.props.history.push(this.props.match.url+'/Schedule')}>Go To</Button>
        ):'Not created'}</div>
      )
    }


    let employeeInfo = window.location.pathname === (globalVariables.subfolder + this.props.match.url) ?(
      <>
      <h1 style={{textAlign:'center'}}>Information</h1>

      {info}

      <div style={{display:'flex',flexDirection:'column'}}>
      {prefs}
      {emplSchedule}
      </div>
      
      {/* Depending on width the list is shown/hidden or the url is changed to /employees where the list is at */}
      <Button 
        btnType='Primary'
        clicked={this.state.width > 500? this.props.listToggle: this.goToList}>
          {this.state.width > 500 ?(this.props.noList ? 'Show' : 'Hide') : null} List
      </Button>
          
      {this.props.isAdmin ?<Button 
        btnType='Danger'
        clicked={this.removeEmployeeHandler}>Remove</Button> : null}

      {/*Modal shown if user wants to delete an empl*/}
      <Modal
        shouldShow={this.state.showModal}
        closeModal={this.removeEmployeeHandler}>
        <p style={{textAlign:'center'}}>Are you sure you want to remove {this.state.employee?this.state.employee.name:null}?</p>
        <Button 
          btnType='Success'
          clicked={this.acceptRemoveHandler}>Yes</Button>
        <Button 
          btnType='Danger'
          clicked={this.removeEmployeeHandler}>Cancel</Button>
      </Modal>

      </>
    ) : 
    // Route to empl schedule at a certain path
    <Route path={this.props.match.url+'/Schedule'}
          render={()=>(
            <>
            <h1 style={{textAlign:'center'}}>{this.state.employee.name} Schedule</h1>
            <AsyncEmployeeSchedule
              startDate={this.props.config.startDate}
              nrDays={this.props.config.nrDays}
              considerWeekends={this.props.config.considerWeekends}
              employeeSchedule={this.state.employee.schedule}/>
            </>
          )}/>;

    // Spinner show if loading prop from changeRemove reducer is true
    if(this.props.loading){
      employeeInfo = <Spinner/>
    }

    //ErrorHandler comp rendered if error from changeRemove reducer is a truthy value
    if(this.props.error){
      employeeInfo = <ErrorHandler
      errorText='Unable to make to make the changes, please try again :('
      errorMsg={this.props.error}
      btnText='Try Again'
      btnClick={this.errorHandler} btn/>
    }

    return(
      <div className={myClasses.join(' ')}>
      {this.props.error ? employeeInfo : this.state.employee ? employeeInfo :<p 
        style={{fontSize:'22px'}}>Unable to find the specified employee</p>}
      </div>
    );
  };
};

const mapStateToProps = state => {
  return {
    employees: state.employees.employees,
    loading: state.changeRemove.loading,
    error: state.changeRemove.error,
    isAdmin: state.auth.admin ==='true' || state.auth.admin === true
  };
};


const mapDispatchToProps = dispatch => {
  return{
    onChange: (id,name,value) => dispatch(actions.change(id,name,value)),
    onResetChangeRemove: () => dispatch(actions.resetChangeRemove()),
    onRemove: (id) => dispatch(actions.remove(id)),
    onResetEmplError: () => dispatch(actions.resetEmplsError())
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(Employee);
