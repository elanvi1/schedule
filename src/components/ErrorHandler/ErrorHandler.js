import React from 'react';

import classes from './ErrorHandler.module.css'
import Button from '../UI/Button/Button';

const errorHandler = (props) => {
  // Component that is rendered when the error prop of a reducer has a truthy value. 
  // It has a custom text, which usually identifies when the error took place
  // It has a error message which is the actual error given by the system
  return(
    <div className={classes.ErrorHandler}>
      <p >{props.errorText}</p>
      <p><strong>Error Message: </strong><em style={{color:'red'}}>{props.errorMsg}</em></p>
      {props.btn ? <Button 
        btnType='Primary'
      clicked={props.btnClick}>Try Again</Button>:null}
    </div>
  );
};

export default errorHandler;