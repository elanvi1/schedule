import React, { Component } from "react";
import {connect} from 'react-redux';

import classes from "./TestAdd.module.css";
import Button from "../../components/UI/Button/Button";
import Input from "../../components/UI/Input/Input";
import Spinner from '../../components/UI/Spinner/Spinner';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler'
import * as actions from '../../store/actions/index';

//Test add is similar to Authenticate, the differences are:
//1. Only admin users can add employees
//2. The added user are not authenticated, therefore they can't login and access server resources. Only their info is being added to the server. The purpose is testing.
//3. Only the Email and name are required

class TestAdd extends Component {
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
        label: "Name * :",
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
        label: "Address :",
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
        label: "E-mail * :",
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
        label: "Project :",
        value: "",
        validation: {
          required: true,
        },
        valid: false,
        changed: false,
      }
    },
    infoValid: false,
  };

  componentWillUnmount(){
    this.props.onResetAuth();
  }

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
      if(elID ==='name' || elID==='email')
      infoIsValid = updatedInfo[elID].valid && infoIsValid;
    }

    this.setState({ employeeInfo: updatedInfo, infoValid: infoIsValid });
  };

  addEmplHandler = (event) => {
    event.preventDefault();

    let newControls = {};
    for (let el in this.state.employeeInfo) {
      newControls[el] = this.state.employeeInfo[el].value;
    }

    delete newControls.password;

    const resetInfo = {};
    for (let elem in this.state.employeeInfo){
      resetInfo[elem]={
        ...this.state.employeeInfo[elem],
        value:''
      };
    };
    this.setState({employeeInfo:resetInfo});

    const employee ={
      ...newControls,
      schedule:'',
      preferences:'',
      userId:Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)
    }

    this.props.onAddEmpl(employee);

    //Need to create an object with all the employee properties. Need to add schedule, preferences and userId which I need to get after registering and dispatch an action
    
  };

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

  errorHandler = () =>{
    this.props.onResetAuth();
  }

  render() {
    
    let infoArray = [];

    for (let elem in this.state.employeeInfo) {
      infoArray.push(this.state.employeeInfo[elem]);
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
      );
    });

    let form = (
      <form onSubmit={this.addEmplHandler}>
          {employeeInfo}
          <Button btnType="Success" disabled={!this.state.infoValid}>
            Add Employee
          </Button>
        </form>
    )

    if(this.props.loading) form = <Spinner/>;
     
    if(this.props.error) form = <ErrorHandler
      errorText='Unable to add employee, please try again :('
      errorMsg={this.props.error}
      btnText='Try again' 
      btnClick={this.errorHandler} btn/>
    

    return (
      <div className={classes.AddEmployee}> 
        <div className={classes.Form}>
          <h1>ADD EMPLOYEE</h1>
          {form}
        </div>
      </div>  
    );
  }
}

const mapStateToProps = state => {
  return {
    loading: state.auth.loading,
    error: state.auth.error
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onAddEmpl: (employee) => dispatch(actions.addEmplOnly(employee)),
    onResetAuth: () => dispatch(actions.resetAuth())
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(TestAdd);
