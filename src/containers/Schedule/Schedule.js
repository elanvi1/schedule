import React,{Component} from 'react';
import {connect} from 'react-redux';
import moment from 'moment';

import classes from './Schedule.module.css';
import Spinner from '../../components/UI/Spinner/Spinner';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';
import Button from '../../components/UI/Button/Button';
import ScheduleItem from './ScheduleItem/ScheduleItem';
import * as actions from '../../store/actions/index';

//The Schedule comp first checks if there is schedule information on the server. If it is it renders the schedule based on that info. If it's not it checks if the necessary conditions are met(there has to be a starting date, number of days, at least on shift and at least one asigned shift, all in config) the user has the option to create the schedule and send the necessary information to the server.
//There are 2 views available:
//1.Contracted view in which only the date appears at first for the working days and when one is clicked, more information appears about that day.
//2. Expanded view in which all schedule information, for each day, is presented and can be viewed without having to select a specific day.

class Schedule extends Component{

  // Show state prop has a prop of it's own with each day with value true of false. The value is changed by clicking on a day. And if true it will show a modal with the schedule for that day
  state={
    expanded:false,
    show:{}
  }

  //On mount the schedule, config and employees info is retrieved from the server
  componentDidMount(){
    this.props.onGetPrerequisites();

    let show = {};
    for(let i=1;i<=31;i++){
      show[`day${i}`] = false;
    }

    this.setState({show:show})
  }

  componentWillUnmount(){
    this.props.onResetSchedule();
  }

  toggleExpanseHandler = () => {
    this.setState(prevState => {
      return {
        expanded: !prevState.expanded
      };
    });
  };

  toggleShowDayHandler = (dayName) => {
    this.setState(prevState => {
      return{
        show:{
          ...this.state.show,
          [dayName]:!prevState.show[dayName]
        }
      };
    });
  };

  //Method used for creating the entire schedule and sending the schedule info to the server and each individual empl.
  createScheduleHandler = () => {
    let schedule = {};

    for(let day in this.props.config.days){
      schedule[day] = this.getDayObject(day);
    }

    let individualSchedule = {};

    for(let empl in this.props.employees){
      individualSchedule[this.props.employees[empl].identifier] = {};
      for(let day in schedule){
        individualSchedule[this.props.employees[empl].identifier][day] = 'Not at work';

        if(schedule[day] !== 'empty'){
          for(let shift in schedule[day]){
            if(schedule[day][shift].empls.find(el => el.identifier === this.props.employees[empl].identifier)){
              individualSchedule[this.props.employees[empl].identifier][day] = schedule[day][shift].value;
              break;
            }
          }
        }
      }
    }

    this.props.onSendSchedule(schedule,individualSchedule);
  }

  //Method that contains the logic for creating a day object which is also returned. The day object contains the necessary information for rendering the schedule for that day.
  getDayObject = (dayName) => {
    let employees = {};
    let day = {};

    for(let empl in this.props.employees){
      let days = {};
      for(let i=1;i<=31;i++){
        days[`day${i}`] = true;
      }

      employees[empl] = {
        days:days,
        name: this.props.employees[empl].name,
        identifier: this.props.employees[empl].identifier,
        userId: this.props.employees[empl].userId
      }
    }

    let shifts = null;

    if(this.props.config.days[dayName].useTemp){
      shifts = this.props.config.templates[this.props.config.days[dayName].useTemp];
    }else{
      shifts = this.props.config.days[dayName].shifts;
    }
   
    for(let shift in shifts){
      if(Number(shifts[shift].nr)>0){
        day[shift] = {
          value: shifts[shift].value,
          empls: []
        }
        for(let i=0 ; i < Number(shifts[shift].nr) ; i++){
          for(let empl in employees){
            if(employees[empl].days[dayName]){
              day[shift].empls.push({
                name:employees[empl].name,
                identifier:employees[empl].identifier,
                userId:employees[empl].userId
              });

              employees[empl].days[dayName] = false;
              break;
            }
          }
        }
      }
    }

    for(let shift in day){
      day[shift].empls = day[shift].empls.sort((el1,el2) => {
        if(el1.name){
          return el1.name.localeCompare(el2.name)
        }else{
          return 0;
        }
      });
    }
  
    let total = 0;
    for(let shift in shifts){
      total = total + Number(shifts[shift].nr);
    }
    if(total===0 || !this.props.employees){day='empty'};

    return day;
  }

  //Dispatches an action that sets the value of error from the schedule reducer to null and fetches the schedule, empls and config info from the server
  errorHandler = () =>{
    this.props.onResetScheduleError();
  }


  render(){
    let bodyMain= null;
    let time = 0;
    let startTime = 0;
    let endTime = 0;
    let j =1;

    //An array of objects holds the information on which the schedule is rendered. Each element of the array represents a day. Each day can be either a working day, non schedule day(outside the config interval) or weekend.
    //A working day contains information regarding the shift an how many employees are on that shift. This info is taken from the schedule from the server.
    //A non schedule day or a weekend day contains a random number
    //Moment library is used to acertain the type of a day. Each day has a different style and only the working days contain relevant info
    if(this.props.employees){
      if(this.props.config.nrDays && this.props.config.startDate && this.props.config.shifts && this.props.config.days){
        if(this.props.schedule){
          time = moment(this.props.config.startDate);
          startTime = 7 + Number(time.format('d'));
          endTime = startTime + Number(this.props.config.nrDays);

          let myArray = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
          
          let daysArray = [];
        
          for(let el in this.props.schedule){
            daysArray.push({
              info: this.props.schedule[el],
              id:el})
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

          time = moment(this.props.config.startDate);
          time=time.subtract(Number(time.format('d')),'days');
          
          bodyMain= (
          <>
            <div style={{display:'flex',justifyContent:'space-around'}}>
              <Button
                btnType='Primary'
                clicked={this.toggleExpanseHandler}>{this.state.expanded ? 'Contract' : 'Expand'}</Button>
              {this.props.isAdmin ? <Button
                btnType='Danger'
                clicked={this.props.onDeleteSchedule}>Delete</Button> : null}
            </div>

            <div className={this.state.expanded ? classes.ContainerExp :classes.Container}>
              {myArray.map((el,i) =>{
            if(i>7)time=time.add(1,'days')
            
            return i>= startTime && i<endTime ? 
            this.props.config.considerWeekends ==='true'
            ? time.format('d') !=='6' && time.format('d') !=='0'
            ? j++ && (
              <ScheduleItem
                {...this.props}
                key={el.id}
                el={el}
                j={j}
                expanded={this.state.expanded}
                show={this.state.show[el.id]}
                toggleShowDay={this.toggleShowDayHandler.bind(this,el.id)}
                timeExp={time.format('MMMM Do')}
                time={time.format('MMM Do')}/>
            ) :(
              <div className={this.state.expanded ? classes.WeekendsExp :classes.Weekends} key={`${i}${el.id}`}>
                {time.format('MMM Do')}
              </div>
            ) : j++ && (
              <ScheduleItem
                {...this.props}
                key={el.id}
                el={el}
                j={j}
                expanded={this.state.expanded}
                show={this.state.show[el.id]}
                toggleShowDay={this.toggleShowDayHandler.bind(this,el.id)}
                timeExp={time.format('MMMM Do')}
                time={time.format('MMM Do')}/>
            ) : i<7 ? (
              <div  className={classes.Header} key={el+i}>
                {el}
              </div>
            ) : (
              <div className={this.state.expanded? classes.InactiveExp : classes.Inactive} key={el+i}>
                {time.format('MMM Do')}
              </div>
            )
            })}
            </div>
          </>
          )
        }else{
          bodyMain= (
            <p className={classes.Info}>All the prerequisites have been fulfilled, please click the create button in order to create the schedule : </p>
          )
        }
      }else{
        //If there is no schedule info on the server and certain conditions for its creation are not met a message will be shown with what conditions are still needed in order to create the schedule
        bodyMain = (
          <p className={classes.Info}>Please fill all the configuration information and allocate and least one shift in order to create the schedule. The following remain: {`${!this.props.config.nrDays ? 'number of days' : ''} ${!this.props.config.startDate ? '[start date]':''} ${!this.props.config.shifts ? 'add at least one shift':''} ${!this.props.config.days ? 'allocate at least one shift' : ''}`}</p>
        );
      }
    }else{
      bodyMain =(
        <p className={classes.Info}>There has to be at least one employee in order to create the schedule</p>
      )
    }

    let body = (
      <>
      {bodyMain}
      {this.props.schedule ? null : (
        <Button 
          btnType='Primary Huge'
          clicked= {this.props.employees ?  this.props.config.nrDays && this.props.config.startDate && this.props.config.shifts && this.props.config.days ? this.createScheduleHandler : null: null}
          disabled={this.props.employees ? this.props.config.nrDays && this.props.config.startDate && this.props.config.shifts && this.props.config.days ? false :true : true}>Create</Button>
      )}
      </>
    )

    let main = (
      <>
        <h1 style={{textAlign:'center'}}>Schedule</h1>
        {body}
      </>
    )

    // Spinner show if loading prop from schedule reducer is true
    if(this.props.loading){
      main=<Spinner/>
    }

    //ErrorHandler comp rendered if error from schedule reducer is a truthy value
    if(this.props.error || this.props.errorSend){
      main=<ErrorHandler
        errorText={this.props.error?'Unable to retrieve the necessary information from the server, please try again :(':'Unable to send the schedule information to the employees, please delete the schedule and create it again'}
        errorMsg={this.props.error ? this.props.error: this.props.errorSend}
        btn btnClick={this.errorHandler}/>
    }
    return (
      <div className={classes.Schedule}>
        {main}
      </div>
    );
  };
};

const mapStateToProps =  state =>{
  return{
    employees: state.employees.employees,
    config: state.config.schedule_config,
    schedule: state.schedule.schedule,
    loading: state.schedule.loading,
    error: state.schedule.error,
    errorSend: state.schedule.errorSend,
    isAdmin: state.auth.admin ==='true' || state.auth.admin === true
  };
};

const mapDispatchToProps = dispatch =>{
  return{
    onGetPrerequisites: () => dispatch(actions.getSchedule()),
    onResetSchedule: () => dispatch(actions.resetSchedule()),
    onSendSchedule: (schedule,indSchd) => dispatch(actions.sendSchedule(schedule,indSchd)),
    onDeleteSchedule: () => dispatch(actions.deleteSchedule()),
    onResetScheduleError: () => dispatch(actions.resetScheduleError())
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(Schedule);