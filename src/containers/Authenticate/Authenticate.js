import React, { Component } from "react";
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';

import classes from "./Authenticate.module.css";
import Button from "../../components/UI/Button/Button";
import Input from "../../components/UI/Input/Input";
import Spinner from '../../components/UI/Spinner/Spinner';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler'
import * as actions from '../../store/actions/index';

class Authenticate extends Component {
  // State contains among others info about the input fields necessary for authentication
  state = {
    employeeInfo: {
      name: {
        elemType: "input",
        elemConfig: {
          type: "text",
          placeholder: "Name",
          name: "name",
          id: "name",
        },
        warning:'At least 1 character required',
        label: "Name:",
        value: "",
        validation: {
          required: true,
        },
        valid: false,
        changed: false,
      },
      address: {
        elemType: "input",
        elemConfig: {
          type: "text",
          placeholder: "Address",
          name: "address",
          id: "address",
        },
        warning:'At least 1 character required',
        label: "Address:",
        value: "",
        validation: {
          required: true,
        },
        valid: false,
        changed: false,
      },
      email: {
        elemType: "input",
        elemConfig: {
          type: "email",
          placeholder: "E-mail",
          name: "email",
          id: "email",
        },
        warning:'Needs to have format ...@...[.]...',
        label: "E-mail:",
        value: "",
        validation: {
          required: true,
          isEmail: true,
        },
        valid: false,
        changed: false,
      },
      project: {
        elemType: "input",
        elemConfig: {
          type: "text",
          placeholder: "Project Name",
          name: "project",
          id: "project",
        },
        warning:'At least 1 character required',
        label: "Project:",
        value: "",
        validation: {
          required: true,
        },
        valid: false,
        changed: false,
      },
      password: {
        elemType: "input",
        elemConfig: {
          type: "password",
          placeholder: "Password",
          name: "password",
          id: "password",
        },
        warning:'Needs to have at least 6 characters',
        label: "Password:",
        value: "",
        validation: {
          required: true,
          minLength: 6,
        },
        valid: false,
        changed: false,
      },
    },
    infoValid: false,
    logIn: true
  };

  // On umount error from auth reducer is set to null
  componentWillUnmount(){
    this.props.onResetAuth();
  }

  // Method triggered by onChange of input elements, it copies the value from the input field to the state and checks if the value is valid
  //There is also a check to see if all the fields have valid info. If so the submit button is no longer disabled
  changeInputHandler = (event, elemIdentifier) => {
    const updatedInfo = {
      ...this.state.employeeInfo,
      [elemIdentifier]: {
        ...this.state.employeeInfo[elemIdentifier],
        value: event.target.value,
        valid: this.validationHandler(
          this.state.employeeInfo[elemIdentifier].validation,
          event.target.value
        ),
        changed: true,
      },
    };

    let infoIsValid = true;

    for (let elID in updatedInfo) {
      if(this.state.logIn){
        if(elID === 'email' || elID ==='password'){
          infoIsValid = updatedInfo[elID].valid && infoIsValid;
        }
      }else{
        infoIsValid = updatedInfo[elID].valid && infoIsValid;
      }
    }

    this.setState({ employeeInfo: updatedInfo, infoValid: infoIsValid });
  };

  //Method used to authenticate the user and send his information to the server if registering. The input fields are reset.
  authHandler = (event) => {
    event.preventDefault();

    let newControls = {};
    for (let el in this.state.employeeInfo) {
      newControls[el] = this.state.employeeInfo[el].value;
    }

    const resetInfo = {};
    for (let elem in this.state.employeeInfo){
      resetInfo[elem]={
        ...this.state.employeeInfo[elem],
        value:'',
        changed:false,
        valid:false
      };
    };
    this.setState({employeeInfo:resetInfo});

    const employee ={
      ...newControls,
      schedule:'',
      preferences:'',
      userId:''
    }

    this.props.onAuth(employee,this.state.logIn);
  };

  //Checks the validation of the info entered by the user in the input fields.
  validationHandler(rules, value) {
    let isValid = true;

    if (!rules) {
      return true;
    }

    if (rules.required) {
      isValid = value.trim() !== "" && isValid;
    }

    if (rules.minLength) {
      isValid = value.length >= rules.minLength && isValid;
    }

    if (rules.maxLength) {
      isValid = value.length <= rules.maxLength && isValid;
    }

    if (rules.isEmail) {
      const pattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
      isValid = pattern.test(value) && isValid;
    }

    return isValid;
  }

  toggleAuthType = () => {
    this.setState(prevState => {
      return {
        logIn: !prevState.logIn
      }
    })
  }

  //Reloads window, only applicable if there is a error
  errorHandler = () =>{
    window.location.reload(false); 
  }

  render(){
    // The input fields are rendered based on information from state
     let infoArray = [];

    for (let elem in this.state.employeeInfo) {
      infoArray.push(this.state.employeeInfo[elem]);
    }

    // In case of login only the password and email fields are shown
    if(this.state.logIn){
      infoArray = infoArray.filter(el =>el.elemConfig.name==='email' || el.elemConfig.name==='password');
    }

    let employeeInfo = infoArray.map((el) => {
      return (
        <Input
          key={el.elemConfig.name}
          formElementType={el.elemType}
          attributes={el.elemConfig}
          value={el.value}
          warning={el.warning}
          label={el.label}
          isValid={!el.valid}
          isChanged={el.changed}
          changed={(event) =>
            this.changeInputHandler(event, el.elemConfig.name)
          }
        />
      ) ;
    });

    let form = (
      <form onSubmit={this.authHandler}>
          {employeeInfo}
          <Button btnType="Success" disabled={!this.state.infoValid}>
            {this.state.logIn ? 'Log in' : 'Register'}
          </Button>
        </form>
    )

    // Spinner is shown when loading from auth reducer is true
    if(this.props.loading) form = <Spinner/>;
     
    //Error Handler comp is rendered when error from auth reducer has a truthy value
    if(this.props.error) form = <ErrorHandler
      errorText='Unable to authenticate employee, please try again :('
      errorMsg={this.props.error}
      btnText='Try again' 
      btnClick={this.errorHandler} btn/>
    
    
    return (
      <div className={classes.Authenticate}> 
        {/*User is redirected to the schedule when authenticated*/}
        {this.props.isAuth ? <Redirect from='/authenticate' to='/'/> : null}
        <div className={classes.Form}>
          <h1>{this.state.logIn ? 'Log in' : 'Register'}</h1>
          {form}
            <p>Switch to <em onClick={this.toggleAuthType.bind(this)}>{this.state.logIn ? 'Register' : 'Log in'}</em></p>
        </div>
      </div>  
    );
  };
};

//The check to see if the user is authenticated is done by checking if there is a token
const mapStateToProps = state => {
  return {
    loading: state.auth.loading,
    error: state.auth.error,
    isAuth: state.auth.token !== ''
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onAuth: (employee,logIn) => dispatch(actions.auth(employee,logIn)),
    onResetAuth: () => dispatch(actions.resetAuth())
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(Authenticate);