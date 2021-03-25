import React from 'react';
import FontAwesome from 'react-fontawesome';

import classes from './TemplateItem.module.css';
import Input from '../../../UI/Input/Input';
import Button from '../../../UI/Button/Button';
import Spinner from '../../../UI/Spinner/Spinner';
import ErrorHandler from '../../../ErrorHandler/ErrorHandler';

const templateItem = (props) => {
  // The template item has 2 functions:
  //1. Add a shift and the number of empls for that shift, same a calendar day.
  //2. Remove the template
  
  let n = 0;

  const allocateShift = (tempName,shiftValue,value) => {
    let shiftName = '';
    props.shifts.forEach(el =>{
      if(el.value === shiftValue){
        shiftName = el.id;
      }
    })
    if(value !== 0){
      props.toggleEdit();
    }

    props.allocateShiftTemplate(tempName,shiftName,{value:shiftValue,nr:value})
  }

  const deleteTemplate = () => {
    props.toggleShowDel();

    let payload = {};
    for(let el in props.days){
      if(props.days[el].useTemp === props.el.id){
        payload[el] = {
          shifts: props.days[el].shifts,
          useTemp:false
        };
      };
    };
    
    props.delTemp(props.el.id,payload);
  }

  const errorHandler = () =>{
    props.resetConfigError();
  }

  let mid = (
    <div>
      {props.edit ?(
        <>
        {props.inputs.map(cur=>(
          <Input
          key={cur.elemConfig.name}
          formElementType={cur.elemType}
          attributes={cur.elemConfig}
          warning={cur.warning}
          value={cur.value}
          isValid={!cur.valid}
          isChanged={cur.changed}
          options={cur.options}
          label={cur.label}
          changed={(event)=> props.changeInput(event,'templates',cur.id,props.el.id)}/>
        ))}
        <div style={{display:'flex',flexDirection:'column'}}>
          <Button btnType='Success' 
          clicked={() => allocateShift(props.el.id,props.inputs[0].value,props.inputs[1].value)}
          disabled={!props.el.input.nrEmpls.valid}>Save</Button>
          <Button btnType='Danger' 
          clicked={props.toggleEdit}>Cancel</Button>
        </div>
        </>
      ):(
        props.shifts.map((cur,i) =>{
          if(cur.nr !== 0)n++;
          return cur.nr !== 0 ? (
            <p key={props.el.id+cur.value} style={{fontWeight:'bold',marginLeft:'5%'}}>{`${n}. ${cur.value} : {${cur.nr}}`}
            <Button btnType='Small Danger'
            clicked={() => allocateShift(props.el.id,cur.value,0)}>x</Button>
            </p>
          ):null
        })
      )}
    </div>
  )

  if(props.showDel){
    mid = (
      <>
      <p style={{textAlign:'center',fontSize:'18px',fontWeight:'bold'}}>Are you sure you want to proceed with the Template removal?</p>
      <div style={{display:'flex',flexDirection:'column'}}>
          <Button btnType='Success' 
          clicked={()=>deleteTemplate()}
          >Yes</Button>
          <Button btnType='Danger' 
          clicked={props.toggleShowDel}>Cancel</Button>
      </div>
      </>
    )
  }

  if(props.loading){
    mid = <Spinner></Spinner>
  }

  if(props.error){
    mid =<ErrorHandler
      errorText={'Unable to make the requested allocation to the templates, please try again :('}
      errorMsg={props.error}
      btn btnClick={errorHandler}/>
  }

  return(
    <div className={classes.Item}>
        <div style={{textTransform:'capitalize',fontSize:'18px',textAlign:'center'}}>{props.el.id}</div>

        {mid}

        <div style={{display:'flex',justifyContent:'space-around'}} >
          <FontAwesome className={props.showDel  ? classes.Invalid : classes.PlusIcon} name='plus-square' size='2x' onClick={props.showDel ? null : props.toggleEdit} key={'PlusIcon'+props.el.id} >
            <div className={classes.PlusTT}>Add Shift</div>
          </FontAwesome>
          <FontAwesome className={props.edit ? classes.Invalid : classes.MinusIcon} name='minus-square' size='2x' onClick={props.edit ? null : props.toggleShowDel} key={'MinusIcon'+props.el.id} >
            <div className={classes.MinusTT}>Delete Template</div>
          </FontAwesome>
      </div>
      </div>
  );
};

export default templateItem;