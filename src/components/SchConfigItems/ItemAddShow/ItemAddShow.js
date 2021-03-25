import React from 'react';

import classes from './ItemAddShow.module.css';
import Input from '../../UI/Input/Input';
import Button from '../../UI/Button/Button';
import Modal from '../../UI/Modal/Modal';

const itemAddShow = (props) => {
  // There are 2 modes: add and show. The add mode has input or select fields in order to determine what information will be sent to the server. The show mode has information about shifts or absences taken from the server with the option to remove a specific one. 
  // Information is presented in a modal
  let itemArray = [];
    if(props.scheduleConfig){
      if(props.scheduleConfig[props.type]){
        for(let el in props.scheduleConfig[props.type]){
          itemArray.push({...props.scheduleConfig[props.type][el],id:el})
        }
        if(props.type==='shifts'){
          itemArray = itemArray.sort((el1,el2) =>{
            if(el1.start){
              return el1.start.localeCompare(el2.start)
            }else return 0;
          });
        }else if(props.type==='absences'){
          itemArray = itemArray.sort((el1,el2) =>{
            if(el1.name){
              return el1.name.localeCompare(el2.name)
            }else return 0;
          });
        }
      };
    };

  let itemAdd = [];
  for(let el in props.inputInfo){
    itemAdd.push({...props.inputInfo[el],id:el});
  }

  let email = null;
  let id = props.inputInfo.name.value.split('___')[1];
  if(props.type==='absences' && props.inputInfo.name.value){
    for(let empl in props.employees){
      if(props.employees[empl].identifier === id){
        email = (
          <div style={{padding:'10px',boxSizing:'border-box',fontSize:'16px'}}>
            <strong>Email : </strong>{props.employees[empl].email}
          </div>
        )
      }
    }
  }

  return(
    <div className={classes.Items}>
        <p>
          <strong style={{textTransform:'capitalize'}}>
            {props.type} : 
          </strong> 
          <Button btnType='Small Success' clicked={props.toggleEdit}>[add]</Button> 
          <Button btnType='Small Primary' clicked={props.scheduleConfig ? props.scheduleConfig[props.type] ? props.toggleShow:null:null}>
            {props.scheduleConfig ? props.scheduleConfig[props.type] ? props.show ?'[hide]':'[show]' : '[empty]':'[empty]'}
          </Button>
        </p>

        <Modal 
          shouldShow={props.show} 
          closeModal={props.toggleShow}>
        <h4 style={{textAlign:'center'}}>{props.type==='shifts' ?'Please keep in mind that removing a shift will cause the deletion of all the allocated shifts(not templates) and schedule': 'Please keep in mind that by removing an absence the schedule will be deleted(not the shift allocations and templates)'}</h4>
        {itemArray.map((el,i) => (
          <div className={classes.Show} key={el.id}>
            <p 
              style={{margin:'4px 10px',fontSize:'17px'}} 
              >
            {i+1}. {el.name} : {el.start} - {el.end}
            </p>
            <Button 
              btnType='Small Danger'
              clicked={()=>props.remove(props.type,el.id)}>x</Button>
          </div>
          )
        )}
        <Button btnType='Danger'
          clicked={props.toggleShow}>Cancel</Button>
        </Modal>

        <Modal 
          shouldShow={props.edit}
          closeModal={props.toggleEdit}>
          <h4 style={{textAlign:'center'}}>Add {props.type} {props.type==='shifts' ? 'and please keep in mind that by doing so the allocated shifts will be deleted(not the templates)' : 'and please keep in mind that by doing so the schedule will be deleted(not the shift allocations and templates)'}</h4>
          <div style={{margin:'15px 0'}}>
            {itemAdd.map(el =>(<Input
              key={el.elemConfig.name}
              formElementType={el.elemType}
              attributes={el.elemConfig}
              warning={el.warning}
              options={el.options}
              value={el.value}
              label={el.label}
              isValid={!el.valid}
              isChanged={el.changed} inLine
              changed={(event)=>props.changeInput(event,'itemsAddRemove',el.id,props.type)}/>) )}
            {email}
          </div>
          <Button 
              btnType='Success' disabled={!props.addInfoValid}
              clicked={()=>props.addInfo(props.type)}>Save</Button>
            <Button 
              btnType='Danger' 
              clicked={props.toggleEdit}>Cancel</Button>
        </Modal>
    </div>
  );
};

export default itemAddShow;