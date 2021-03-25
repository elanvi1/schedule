import React from 'react';


import classes from './Templates.module.css';
import Button from '../../UI/Button/Button';
import TemplateItem from './TemplateItem/TemplateItem';
import Modal from '../../UI/Modal/Modal';


const templates = (props) => {
  // The templates are created based on the templates info from the server. Each template has a name and objects that represent each shift with a property containing the interval of the shift and another containing the nr. of employees on that shift
  // A template can be used by multiple days and a change in the template will automatically update the calendar day that uses that template.
  
  let templatesArray = [];
  let main = null;
  let body = null;
  if(props.scheduleConfig){
    if(props.scheduleConfig.templates){
      for(let el in props.scheduleConfig.templates){
        templatesArray.push({info:props.scheduleConfig.templates[el],input:props.tempsInput[el],id:el})
      }
    }
  }
  

  if(props.scheduleConfig){
    if(props.scheduleConfig.templates){
      if(props.show.templates){
        body = (
          <div className={classes.List}>
          {templatesArray.map(el =>{
            let shiftsArray = [];
            let inputsArray = [];
          
            for(let item in el.input){
              inputsArray.push({...el.input[item],id:item})
            }
          
            for(let item in el.info){
              shiftsArray.push({...el.info[item],id:item})
            }
          
            shiftsArray = shiftsArray.sort((el1,el2)=>{
              if(el1.value){
                return el1.value.localeCompare(el2.value)
              }else{
                return 0;
              }
            })
            return (
              <TemplateItem
                key={el.id}
                edit={props.edit[el.id]}
                showDel={props.show[el.id]}
                inputs={inputsArray}
                days={props.scheduleConfig.days}
                el={el}
                loading={props.load[el.id]}
                error={props.error[el.id]}
                changeInput={props.changeInput}
                allocateShiftTemplate={props.allocateShiftTemplate}
                toggleEdit={() => props.toggleEditTemps(el.id)}
                toggleShowDel={() => props.toggleShowTemps(el.id)}
                shifts={shiftsArray}
                delTemp={props.delTemp}
                resetConfigError={props.resetConfigError}/>
            )
          })}
        </div>
        )
      }
    }
  }
  

  if(props.scheduleConfig){
  main = (
    <>
    <div className={classes.Title}>
      <strong>Templates : </strong>
        <Button 
          btnType='Small Primary'
          clicked={props.scheduleConfig.templates ?() => props.toggleShowTemps('templates'):null}>
            {props.scheduleConfig.templates ? props.show.templates ? '[hide]' : '[show]' : '[empty]'}
        </Button>
    </div>
    <Button btnType='Primary'
      clicked={()=>props.toggleShowTemps('expandedAlloc')}>{props.expAlloc ? 'Contract':'Expand'}</Button>
    <Modal
      shouldShow={props.show.templates}
      closeModal={() => props.toggleShowTemps('templates')}
      wider>
      {body}
    </Modal>
    </>
  )
  }



  return (
    <div className={classes.Template}>
      {main}
    </div>
  );
};

export default templates;