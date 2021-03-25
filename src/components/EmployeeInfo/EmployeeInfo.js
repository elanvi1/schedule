import React from 'react';

import classes from './EmployeeInfo.module.css';
import EditItem from '../../components/EditItem/EditItem';

const employeeInfo = (props) => {
  // EmployeeInfo renders an EditItem comp for each object in the state that holds the info for rendering an input field
  let infoArray = [];

  for(let elem in props.info){
  infoArray.push(props.info[elem]);
  };

  if(!props.admin){
    infoArray = infoArray.filter(curr => curr.elemConfig.name !=='address')
  }
  
  let info = infoArray.map (el => {
   
    if(!props.multipleInputCateg) {return (
        <EditItem
          key={el.elemConfig.name}
          title={el.elemConfig.name+' : '}
          edit={props.edit[el.elemConfig.name]}
          inputInfo={el}
          value={props.employee[el.elemConfig.name]}
          changeInput={props.changeInput}
          toggleEdit={()=>props.toggleEdit(el.elemConfig.name)}
          save={()=>props.save(props.employee.identifier,el.elemConfig.name,el.value)}
          admin={props.admin}
          />
    )}else{
      return (
        <EditItem
          key={el.elemConfig.name}
          title={el.elemConfig.name+' : '}
          edit={props.edit[el.elemConfig.name]}
          inputInfo={el}
          value={props.employee[el.elemConfig.name]}
          multipleInputCateg
          inputCateg={props.inputCateg}
          changeInput={props.changeInput}
          toggleEdit={()=>props.toggleEdit(el.elemConfig.name)}
          save={()=>props.save(props.employee.identifier,el.elemConfig.name,el.value)}
          admin={props.admin}/>
      )
    }
  })
   return(
    <div className={classes.EmployeeInfo}>
      {info}
    </div>
   );
};

export default employeeInfo;