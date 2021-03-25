import React from 'react';

import classes from './EditItem.module.css'
import Button from '../UI/Button/Button';
import Input from '../UI/Input/Input';

const editItem = (props) => {
  // EditItem offers 2 options, one edit and one view. Bases on the props that are passed it toggles between them.
  // The view holds that name of the  element and it's value which is taken from the server
  // The edit holds an input field where the user can change the value of the element.
  return (
    <div className={classes.CanEdit}>
      <div>
        <strong style={{textTransform:'capitalize'}}>
          {props.title}
        </strong>
        {props.edit ?( <Input 
        formElementType={props.inputInfo.elemType}
        attributes={props.inputInfo.elemConfig}
        value={props.inputInfo.value}
        warning={props.inputInfo.warning}
        isValid={!props.inputInfo.valid}
        isChanged={props.inputInfo.changed}
        options={props.inputInfo.options}
        changed={props.multipleInputCateg? 
          (event)=> props.changeInput(event,props.inputCateg,props.inputInfo.elemConfig.name):
          (event)=> props.changeInput(event,props.inputInfo.elemConfig.name)}
        noLabel inLine/>
        ): 
        props.value ? props.value: 'None added'}
      </div>
      <div>
        {props.admin ? <Button 
          btnType='LightGreen Small'
          noShow = {props.edit ? true:false}
          clicked={props.toggleEdit}>[edit]</Button>:null}
       
        <Button
          btnType='Success Small'
          noShow = {props.edit ? false:true}
          disabled ={props.inputInfo.valid ?false:true}
          clicked={props.save}>save</Button>
        <Button
          btnType='Danger Small'
          noShow = {props.edit ? false:true}
          clicked={() => props.toggleEdit(true)}>cancel</Button>
      </div>
  </div>
  );
};

export default editItem;