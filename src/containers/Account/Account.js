import React,{Component} from 'react';
import {connect} from 'react-redux';

import classes from './Account.module.css';
import Input from '../../components/UI/Input/Input';
import Button from '../../components/UI/Button/Button';
import Modal from '../../components/UI/Modal/Modal';
import EmployeeInfo from '../../components/EmployeeInfo/EmployeeInfo';
import Spinner from '../../components/UI/Spinner/Spinner';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';
import * as actions from '../../store/actions/index';

class Account extends Component{

  //Account elements are: Name, Project,Address,Email,Preferences and Password. The first 4 have an input field each used when changing info and each input field has a state object based on which it's rendered. The latter 2 follow the same pattern but have multiple fields. Preference has as many select elements as shifts and password has 2 input fields one for change password and one for confirm password
  //Name, Project,Address,Email have a view and edit mode
  //Preferences go by the same principle, the difference is that edit mode is shown in a modal and view mode creates a new div with the info
  //The first 4 account elements can be changed by clicking the eddit button which changes the edit state property of that account element which in turn allows the appearance of the input field
  //The latter 2 account elements show a modal when clicking the edit and change button respectively which is done by changing the show modal state prop of that account element.
  
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
        value:'',
        validation:{
          required:true,
          isEmail: true,
        },
        valid:false,
        changed:false
      }
    },
    edit: {
      name: false,
      email: false,
      address:false,
      project:false,
    },
    passwords:{
      newPassword:{
        elemType: "input",
        elemConfig: {
          type: "password",
          placeholder: "New Password",
          name: "newPassword",
          id: "newPassword",
        },
        warning:'Needs to have at least 6 characters',
        label: "New password : ",
        value: "",
        validation: {
          required: true,
          minLength: 6,
        },
        valid: false,
        changed: false,
      },
      confirmPassword:{
        elemType: "input",
        elemConfig: {
          type: "password",
          placeholder: "Confirm Password",
          name: "confirmPassword",
          id: "confirmPassword",
        },
        warning:'Needs to have at least 6 characters',
        label: "Confirm password : ",
        value: "",
        validation: {
          required: true,
          minLength: 6,
        },
        valid: false,
        changed: false,
      }
    },
    employee:null,
    preferences:null,
    showPrefs:false,
    hasPrefDuplicate: true,
    passEqual:false,
    showModal:{
      preferences: false,
      passwords: false
    }
  }

  //On mount make request to get employees and config info from server
  componentDidMount(){
    this.props.onGetPrerequisites();
  }

  //Set state prop employee with the employee info from employees based on userId match with the userId from auth reducer
  componentDidUpdate(prevProps){
    if(this.props.employees && JSON.stringify(this.props.employees) !== JSON.stringify(prevProps.employees)){
      for(let empl in this.props.employees){
        if(this.props.employees[empl].userId===this.props.userId){
          this.setState({employee:this.props.employees[empl]})
        }
      }
    }
  }

  componentWillUnmount(){
    this.props.onResetAccount();
    this.props.onResetConfig();
  }

  toggleShowPrefs = () => {
    this.setState(prevState =>{
      return{showPrefs:!prevState.showPrefs}
    })
  }

  //When accessing or closing the password and preferences modal the containing state info for input fields is reset and in the case of the preferences the state info for the input fields is dynamically rendered as the shifts are not known
  toggleModalHandler = (type) => {
    this.setState(prevState =>{
      return{
        showModal:{
          ...this.state.showModal,
          [type]:!prevState.showModal[type]
        }
      }
    })

    if(type==='passwords'){
      this.setState(prevState =>{
        return{
          [type]:{
            ...this.state[type],
            newPassword:{
              ...this.state[type].newPassword,
              value:'',
              valid:false,
              changed:false
            },
            confirmPassword:{
              ...this.state[type].confirmPassword,
              value:'',
              valid:false,
              changed:false
            }
          },
          passEqual:false
        }
      })
    }

    if(type==='preferences'){
      let preferences ={};
      let shifts = []
      let shiftNames = [];
      let i = 0;
      
      for(let el in this.props.config.shifts){
        shifts.push(this.props.config.shifts[el]);
      }

      shifts.sort((el1,el2) =>{
        if(el1.start){
          return el1.start.localeCompare(el2.start)
        }else return 0;
      })

      shifts.forEach(el =>{
        shiftNames.push(`${el.name}: ${el.start}-${el.end}`)
      })
      
      for(let el in shifts){
        i++;
        preferences[i] = {
          elemType:'select',
          elemConfig: {
            name:shifts[el].name,
            id:shifts[el].name
          },
          options: shiftNames,
          value: shiftNames[0],
          validation:{
            required:true
          },
          valid:true
        }
      }

      this.setState({preferences:preferences,hasPrefDuplicate:true})
    }
  }

  //The state info for the input fields is reset when toggling between view and edit mode 
  toggleEditHandler = (type) =>{
    this.setState((prevState)=>{
      return {edit: {
        ...this.state.edit,
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
      };
    });
  };

  //Method attached to the onChange event of each input field. It copies the value from the input field to the corresponding state object and checks if the value is valid or in the case of multiple values checks if a specifc criteria is met. In the case of preferences checks if the preferences repeat and in the case of passwords checks if the passwords match thus disabling the submit button if necessary.
  changeInputHandler = (event,category,elemIdentifier) => {
    const updatedInfo ={
      ...this.state[category],
      [elemIdentifier]:{
        ...this.state[category][elemIdentifier],
        value: event.target.value,
        valid: this.validationHandler(this.state[category][elemIdentifier].validation, event.target.value),
        changed: true
      }
    }

    this.setState({
      [category]:updatedInfo,
      hasPrefDuplicate: category==='preferences' ? this.hasPrefDuplicate(updatedInfo):true,
      passEqual:category==='passwords' ? (updatedInfo.newPassword.value===updatedInfo.confirmPassword.value) && (updatedInfo.newPassword.value!==''):true});
  }

  //Rules for validation, each state object on which the input field is rendered has at least one rule. 
  validationHandler(rules,value) {
    let isValid = true;
    if (!rules) {
        return true;
    }
    if (rules.required) {
        isValid = value.trim() !== '' && isValid;
    }
    if (rules.minLength) {
      isValid = value.length >= rules.minLength && isValid;
    }
    if (rules.isEmail) {
        const pattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        isValid = pattern.test(value) && isValid;
    }
    return isValid;
  } 

  //Information entered in the input or select elements is sent to server for the specific user if valid.
  saveChangeHandler = (identifier, name,value) => {
    this.props.onChange(identifier,name,value)

    this.toggleEditHandler(name);
  }

  savePreferencesHandler =() => {
    let prefs ={};
    for(let el in this.state.preferences){
      prefs[el] = this.state.preferences[el].value;
    }
    this.props.onChange(this.state.employee.identifier,
    'preferences',prefs)

    this.toggleModalHandler('preferences');
  }

  changePassHandler = () => {
    this.props.onChangePass(this.state.passwords.newPassword.value);
    this.toggleModalHandler('passwords');
  }

  hasPrefDuplicate = (prefs) =>{
    var valuesSoFar = Object.create(null);
    for(let el in prefs){
      var value = prefs[el].value;
      if(value in valuesSoFar){
        return true;
      }
      valuesSoFar[value] = true;
    }
    return false;
  }
  
  //Dispatches an action that sets the value of error from the changeRemove reducer to null and fetches the empls and config info from the server
  errorHandler = () =>{
    this.props.onResetAccountError();
  }
  
  render(){
    let info = null;
    // The edit/view toggle is handled by the EmployeeInfo comp for Name,Project,Email and Address 
    if(this.state.employee){
      info = <EmployeeInfo 
      multipleInputCateg
      inputCateg='info'
      info={this.state.info}
      employee={this.state.employee}
      edit={this.state.edit}
      toggleEdit={this.toggleEditHandler}
      changeInput={this.changeInputHandler}
      save={this.saveChangeHandler}
      admin={true}/>
    }

    //The preferences info for the modal with the select fields created based on the corresponding state info
    let prefs = null;
    let prefsArray = [];
    if(this.state.preferences && this.state.showModal.preferences){
      for(let el in this.state.preferences){
        prefsArray.push(this.state.preferences[el]);
      }

      prefs = prefsArray.map((pref,i) => {
       return <div 
        className={classes.Preference} key={pref.elemConfig.id}>
          <strong>{i+1}</strong>. <Input
            formElementType={pref.elemType}
            attributes={pref.elemConfig}
            value={pref.value}
            isValid={!pref.valid}
            isChanged={pref.changed}
            options={pref.options}
            changed={(event)=> this.changeInputHandler(event,'preferences',i+1)}
            noLabel />
        </div>
      })
    }

    //The preferences shown in order based on the info from the server
    let prefsBody = null;
    let prefsShow = null;
    if(this.state.employee){
    prefsShow= (
      <>
      {this.state.showPrefs && this.state.employee? this.state.employee.preferences.map((el,i)=>{
          return i!==0 ?<div className={classes.Pref}><strong>{i}. </strong>{el}</div>:null
      }):null}
      </>
    )
    prefsBody = (
      <>
      <div className={classes.ItemChange}>
        <strong>Preferences : </strong>
        <Button 
          btnType='Small LightGreen'
          clicked={this.toggleModalHandler.bind(this,'preferences')}>[edit]</Button>
        <Button 
        btnType='Small Primary'
        clicked={this.state.employee.preferences ?this.toggleShowPrefs:null}>{this.state.employee.preferences ? this.state.showPrefs?'[hide]':'[show]':'[empty]'}</Button>
      </div>
      {prefsShow}
      
      <Modal
        shouldShow={this.state.showModal.preferences}
        closeModal={this.toggleModalHandler.bind(this,'preferences')}>
        <h4 style={{textAlign:'center'}}>Please select your shift preference and make sure each preference has a unique value:
        </h4>
        {prefs}
        <Button
          btnType='Success'
          disabled={this.state.hasPrefDuplicate}
          clicked={this.savePreferencesHandler}>Save</Button>
        <Button
          btnType='Danger'
          clicked={this.toggleModalHandler.bind(this,'preferences')}>Cancel</Button>
      </Modal>
      </>
    )}

    //The password input fields for the modal created based on the corresponding state info
    let pass = null;
    let passBody = null;
    let passArray = [];
    if(this.state.employee){
      for(let el in this.state.passwords){
        passArray.push({...this.state.passwords[el],id:el})
      }
      pass= passArray.map((el,i)=>(
        <Input
        key={el.id+i}
        formElementType={el.elemType}
        attributes={el.elemConfig}
        warning={el.warning}
        value={el.value}
        label={el.label}
        isValid={!el.valid}
        isChanged={el.changed}
        changed={(event)=> this.changeInputHandler(event,'passwords',el.id)}
        inLine />
      ))
      passBody =(
        <>
        <div className={classes.ItemChange}>
          <strong>Password : </strong>
          <Button 
            btnType='Small LightGreen'
            clicked={this.toggleModalHandler.bind(this,'passwords')}>change</Button>
        </div>
        
          <Modal
          shouldShow={this.state.showModal.passwords}
          closeModal={this.toggleModalHandler.bind(this,'passwords')}>
            <h4 style={{textAlign:'center'}}>Please fill in the fields bellow accordingly:
            </h4>
            {pass}
            <Button
              btnType='Success'
              disabled={!this.state.passEqual}
              clicked={this.changePassHandler}>Change</Button>
            <Button
              btnType='Danger'
              clicked={this.toggleModalHandler.bind(this,'passwords')}>Cancel</Button>
          </Modal>
        
        </>
      )
    }

    let accountBody = (
      <>
        <h1 style={{textAlign:'center'}}>Account Info</h1>
        {info}
        {prefsBody}
        {passBody}
      </>
    )
  
    //Spinner show if loading prop from changeRemove reducer is true
    if(this.props.loading){
      accountBody = <Spinner/>
    }

    //ErrorHandler comp rendered if error from changeRemove reducer is a truthy value
    if(this.props.error){
      accountBody = <ErrorHandler
      errorText='Unable to change or access account information, please try again :('
      errorMsg={this.props.error}
      btnText='Try Again'
      btnClick={this.errorHandler} btn/>
    }

    return(
      <div className={classes.Account}>
        {accountBody}
      </div>
    );
  };
};

const mapStateToProps = state => {
  return {
    employees: state.employees.employees,
    loading: state.changeRemove.loading,
    error: state.changeRemove.error,
    userId: state.auth.userId,
    config: state.config.schedule_config,
  };
};

const mapDispatchToProps = dispatch => {
  return{
    onGetPrerequisites: () => dispatch(actions.getConfig('account')),
    onChange: (id,name,value) => dispatch(actions.change(id,name,value)),
    onResetAccount: () => dispatch(actions.resetChangeRemove()),
    onRemove: (id) => dispatch(actions.remove(id)),
    onChangePass: (pass) => dispatch(actions.changePassword(pass)),
    onResetConfig: () => dispatch(actions.resetConfig()),
    onResetAccountError: () => dispatch(actions.resetAccountError())
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(Account);