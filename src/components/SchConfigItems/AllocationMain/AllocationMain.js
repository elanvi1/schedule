import React from 'react';
import FontAwesome from 'react-fontawesome';

import classes from './AllocationMain.module.css';
import Button from '../../UI/Button/Button';
import Input from '../../UI/Input/Input';
import Spinner from '../../UI/Spinner/Spinner';
import ErrorHandler from '../../ErrorHandler/ErrorHandler';
import Modal from '../../UI/Modal/Modal';

const allocationMain = (props)=>{
  
  // AllocationMain represents a day of the calendar and has shifts with the respective number of employees, a shift can be removed. 
  //Each day has objects that represent each shift with a property containing the interval of the shift and another containing the nr. of employees on that shift
  //It has 4 functions:
  //1. Add shift with the number of employees
  //2. Use a template
  //3. Add a template based on shifts that were added on that day
  //4. Remove a template
  //Each day has the option to use the allocated shifts or use a template via the useTemplate prop. This will specify the name of the template. 

  let n =0;
  let z =0;
  let inputs = [];
  let shifts = [];
  let myClasses = [classes.Item];

  if(props.el.id){
    for(let item in props.el.input){
      inputs.push({...props.el.input[item],id:item})
    }
    for(let item in props.el.shifts){
      shifts.push(props.el.shifts[item])
    }
    shifts = shifts.sort((el1,el2)=>{
      if(el1.value){
        return el1.value.localeCompare(el2.value)
      }else{
        return 0;
      }
    })
  }

  if(!props.expand){
    myClasses.push(classes.ItemNoExp);
  }

  const errorHandler = () =>{
    props.resetConfigError();
  }

  const useTemplateHandler = () => {
    props.toggleTemp('use',props.el.id);

    props.useTemplate(props.el.id,props.el.template.use.value);
  }

  const removeTemplateHandler = () => {
    props.toggleTemp('remove',props.el.id);

    props.useTemplate(props.el.id,false);
  }

  let mid = (
    shifts.map((cur,i) =>{
      if(cur.nr !== 0)n++;
      return cur.nr !== 0 ? (
        <p key={props.el.id+cur.value} style={{fontWeight:'bold',marginLeft:'5%'}}>{`${n}. ${cur.value} : {${cur.nr}}`}
        <Button btnType='Small Danger'
        clicked={()=> props.allocateShift(props.el.id,cur.value,0)}>x</Button>
        </p>
      ):null
    })
  );

  if(props.el.useTemp){
    let templateArray = [];
    for(let el in props.el.allTemps){
      if(el === props.el.useTemp){
        for(let item in props.el.allTemps[el]){
          templateArray.push({...props.el.allTemps[el][item],id:item})
        }
      }
    }

    templateArray = templateArray.sort((el1,el2)=>{
      if(el1.value){
        return el1.value.localeCompare(el2.value)
      }else{
        return 0;
      }
    })

    mid = (
      <>
      <h4 style={{textAlign:'center'}}>{props.el.useTemp}</h4>
      {templateArray.map(cur => {
        if(cur.nr !== 0) z++;
        return cur.nr !==0 ? (
          <p key={props.el.id+cur.id+props.el.useTemp} style={{fontWeight:'bold',marginLeft:'5%'}}>{`${z}. ${cur.value} : {${cur.nr}}`}</p>
        ) : null
      })}
      </>
    )
  }

  if(props.edit){
    mid = (
      <>
      {inputs.map(cur=>(
        <Input
        key={props.el.id+cur.id}
        formElementType={cur.elemType}
        warning={cur.warning}
        attributes={cur.elemConfig}
        value={cur.value}
        isValid={!cur.valid}
        isChanged={cur.changed}
        options={cur.options}
        label={cur.label}
        changed={(event)=> props.changeInputDays(event,props.el.id,cur.id)}/>
      ))}
      <div style={{display:'flex',flexDirection:'column'}}>
        <Button btnType='Success' 
        clicked={() => props.allocateShift(props.el.id,props.el.input.shift.value,props.el.input.nrEmpls.value)}
        disabled={!props.el.input.nrEmpls.valid}>Save</Button>
        <Button btnType='Danger' 
        clicked={props.toggleDays}>Cancel</Button>
      </div>
      </>
    )
  }

  if(props.editTempAdd){
    mid =(
      <>
      <Input
        key={props.el.template.add.elemConfig.name}
        formElementType={props.el.template.add.elemType}
        attributes={props.el.template.add.elemConfig}
        warning={props.el.template.add.warning}
        value={props.el.template.add.value}
        isValid={!props.el.template.add.valid}
        isChanged={props.el.template.add.changed}
        label={props.el.template.add.label}
        changed={(event)=> props.changeInputTemp(event,props.el.id,'add')}
        />
        <div style={{display:'flex',flexDirection:'column'}}>
          <Button btnType='Success' 
          disabled={!props.el.template.add.valid}
          clicked={() => {props.addTemplate(props.el.id,props.el.template.add.value,props.el.shifts)
            props.toggleTemp('add',props.el.id)}}>Add</Button>
          <Button btnType='Danger' 
          clicked={() => props.toggleTemp('add',props.el.id)}>Cancel</Button>
        </div>
      </>
    )
  }

  if(props.editTempUse){
    let curEmpls = 0;

    for(let shift in props.el.allTemps[props.el.template.use.value]){
      curEmpls = curEmpls + Number(props.el.allTemps[props.el.template.use.value][shift].nr);
    }

    let showWarning = !(curEmpls <= props.totalEmpls);

    mid = props.el.template.use.options.length > 0 ? (
      <>
      <Input
        key={props.el.template.use.elemConfig.name}
        formElementType={props.el.template.use.elemType}
        attributes={props.el.template.use.elemConfig}
        value={props.el.template.use.value}
        isValid={!props.el.template.use.valid}
        isChanged={props.el.template.use.changed}
        label={props.el.template.use.label}
        options={props.el.template.use.options}
        changed={(event)=> props.changeInputTemp(event,props.el.id,'use')}
        />

      {showWarning ? <div style={{color:'red',fontSize:'12px',textAlign:'center'}}>
        * The number of employees from this template is higher than the total number of employees({props.totalEmpls})
        </div> : null}

      <div style={{display:'flex',flexDirection:'column'}}>
        <Button btnType='Success' 
          disabled = {showWarning}
          clicked={() => useTemplateHandler()}>Use</Button>
        <Button btnType='Danger' 
        clicked={() => props.toggleTemp('use',props.el.id)}>Cancel</Button>
      </div>
      </>
    ) : <div style={{textAlign:'center'}}>There are no templates created at this time</div>
  }

  if(props.editTempRemove){
    mid = (
      <>
      <p style={{textAlign:'center',fontSize:'18px',fontWeight:'bold'}}>Are you sure you want to unbind this day from {props.el.useTemp}?</p>
      <div style={{display:'flex',flexDirection:'column'}}>
        <Button btnType='Success' 
          clicked={() => removeTemplateHandler()}>UnBind</Button>
        <Button btnType='Danger' 
        clicked={() => props.toggleTemp('remove',props.el.id)}>Cancel</Button>
      </div>
      </>
    )
  }

  if(props.loadAlloc[props.el.id]){
    mid= <Spinner/>
  }

  if(props.errorAloc[props.el.id]){
    mid = <ErrorHandler
    errorText={'Unable to make the allocation related action, please try again :('}
    errorMsg={props.errorAloc[props.el.id]}
    btn btnClick={errorHandler}/>
  }

  let body = (
    <div className={myClasses.join(' ')}>
      <div style={{fontSize:'22px',color:'purple',textAlign:'center'}}>
        <strong>{`${props.j-1}. `}</strong>
        <em>{props.time}</em> 
      </div>
      <div >
        {mid}
      </div>
      <div style={{display:'flex',justifyContent:'space-between'}} >
        <FontAwesome className={props.editTempAdd || props.editTempUse || props.editTempRemove|| props.el.useTemp? classes.Invalid : classes.PlusIcon} name='plus-square' size='2x' onClick={props.editTempAdd || props.editTempUse || props.el.useTemp || props.editTempRemove ? null : props.toggleDays} key={'PlusIcon'+props.el.id} >
          <div className={classes.PlusTT}>
            {props.editTempAdd || props.editTempUse || props.editTempRemove?'One action at a time' :props.el.useTemp?'Template Locked' :'Add Shift'}
          </div>
        </FontAwesome>
        <FontAwesome className={props.edit || props.editTempAdd || props.editTempRemove||props.el.useTemp? classes.Invalid :classes.GetIcon} name='download' size='2x' onClick={props.edit || props.editTempAdd || props.el.useTemp || props.editTempRemove ? null : () => props.toggleTemp('use',props.el.id)} key={'GetIcon'+props.el.id}>
          <div className={classes.GetTT} >
            {props.edit || props.editTempAdd || props.editTempRemove?'One action at a time' :props.el.useTemp?'Template Locked' :'Use Template'}
          </div>
        </FontAwesome>
        <FontAwesome className={props.edit || props.editTempUse ||props.editTempRemove|| props.el.useTemp? classes.Invalid :classes.SaveIcon} name='save' size='2x' onClick={props.edit || props.editTempUse || props.el.useTemp || props.editTempRemove ? null : () => props.toggleTemp('add',props.el.id)} key={'SaveIcon'+props.el.id}>
          <div className={classes.SaveTT}>
          {props.edit || props.editTempUse || props.editTempRemove?'One action at a time' :props.el.useTemp?'Template Locked' :'Add Template'}
          </div>
        </FontAwesome>
        <FontAwesome className={props.edit || props.editTempUse  || props.editTempAdd || !props.el.useTemp ? classes.Invalid : classes.MinusIcon} name='minus-square' size='2x' onClick={props.edit || props.editTempUse  || props.editTempAdd || !props.el.useTemp? null : () => props.toggleTemp('remove',props.el.id)} key={'MinusIcon'+props.el.id}>
          <div className={classes.MinusTT}>
          {props.edit || props.editTempUse || props.editTempAdd?'One action at a time' :props.el.useTemp ?'Remove Template':'No template to remove'}
          </div>
        </FontAwesome>
      </div>
    </div>
  );

  let modal = props.expand ? null : (
    <Modal
      shouldShow={props.showDay}
      closeModal={props.toggleShowDay}>
      {body}
    </Modal>
  )

  let main = props.expand ? body :(
    <div onClick={props.toggleShowDay} className={classes.MinDay}>
      <strong>{props.j-1} . </strong>{props.timeMin}
    </div>
  )
  

  return (
    <>
    {main}
    {modal}
    </>
    );
};

export default allocationMain;