import React from 'react';
import moment from 'moment';

import classes from './EmployeeSchedule.module.css';

//An array of objects holds the information on which the schedule is rendered. Each element of the array represents a day. Each day can be either a working day, non schedule day(outside the config interval) or weekend.
//A working day contains information regarding the shift the employee has for that day. This info is taken from the schedule property of the employee from the server.
//A non schedule day or a weekend day contains a random number
//Moment library is used to acertain the type of a day. Each day has a different style and only the working days contain relevant info
const employeeSchedule = (props) => {
  let time = moment(props.startDate);
  let startTime = 7 + Number(time.format('d'));
  let endTime = startTime + Number(props.nrDays);

  let myArray = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  
  let daysArray = [];
  for(let day in props.employeeSchedule){
    daysArray.push({id:day,shift:props.employeeSchedule[day]});
  }

  daysArray = daysArray.sort((el1,el2) =>{
    if(el1.id){
      let id1= Number(el1.id.slice(3));
      let id2= Number(el2.id.slice(3));
      return id1-id2;
    }else return 0;
  })
  

  for(let i=0; i<Number(time.format('d'));i++){
    myArray.push(i);
  }

  let q = 0;
  for(let i=startTime;i<endTime;i++){
      myArray.push(daysArray[q]);
      if(i!==startTime){
        time.add(1,'days');
      }
      q++;
  }
  
  for(let i=0; i<6-Number(time.format('d'));i++){
    myArray.push(i);
  }

  time = moment(props.startDate);
  time=time.subtract(Number(time.format('d')),'days');
  let j =1;

  return(
    <div className={classes.Container}>
      {myArray.map((el,i) =>{
        if(i>7)time=time.add(1,'days')
        
        return i>= startTime && i<endTime ? 
        props.considerWeekends ==='true'
        ? time.format('d') !=='6' && time.format('d') !=='0'
        ? j++ && (
          <div className={classes.MinDay} key={el.id}>
            <strong>{j-1} . {time.format('MMM Do')}</strong>
            <div>{el.shift}</div>
          </div>
        ) :(
          <div className={classes.Weekends} key={i+el.id}>
            {time.format('MMM Do')}
          </div>
        ) : j++ && (
          <div className={classes.MinDay} key={el.id}>
            <strong>{j-1} . {time.format('MMM Do')}</strong>
            <div>{el.shift}</div>
          </div>
        ) : i<7 ? (
          <div  className={classes.Header} key={el+i}>
            {el}
          </div>
        ) : (
          <div className={classes.Inactive} key={el+i}>
            {time.format('MMM Do')}
          </div>
        )
      })}
    </div>
  );
};

export default employeeSchedule;