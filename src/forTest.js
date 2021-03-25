import React, {Component} from 'react';
import {connect} from 'react-redux';

import classes from './ScheduleConfig.module.css';
import Button from '../../components/UI/Button/Button';
import Input from '../../components/UI/Input/Input';
import Spinner from '../../components/UI/Spinner/Spinner';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';
import * as actions from '../../store/actions/index';
import Shifts from '../../components/SchConfigItems/Shifts/Shifts';
import EditItem from '../../components/EditItem/EditItem';


class ScheduleConfig extends Component {
  state ={
    shiftsAdd:{
      name:{
        elemType:'input',
        elemConfig: {
          type:'text',
          placeholder:'Name',
          name:'name',
          id:'name'
        },
        label:'Name : ',
        value:'',
        validation:{
          required:true
        },
        valid:false,
        changed: false
      },
      schedule_start:{
        elemType:'select',
        elemConfig: {
          name:'schedule_start',
          id:'schedule_start'
        },
        options:['00:00','00:30','01:00','01:30','02:00','02:30','03:00','03:30','04:00','04:30','05:00','05:30','06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30','23:00','23:30'],
        label:'Schedule Start : ',
        value:'00:00',
        validation:{
          required:true
        },
        valid:true
      },
      schedule_end:{
        elemType:'select',
        elemConfig: {
          name:'schedule_end',
          id:'schedule_end'
        },
        options:['00:00','00:30','01:00','01:30','02:00','02:30','03:00','03:30','04:00','04:30','05:00','05:30','06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30','23:00','23:30'],
        label:'Schedule End : ',
        value:'00:00',
        validation:{
          required:true
        },
        valid:true
      },
    },
    dates:{
      startDate:{
        elemType:'input',
        elemConfig: {
          type:'date',
          name:'startDate',
          id:'startDate'
        },
        label:'Start Date : ',
        value:``,
        validation:{
          required:true
        },
        valid:false
      },
      endDate:{
        elemType:'input',
        elemConfig: {
          type:'date',
          name:'endDate',
          id:'endDate'
        },
        label:'End Date : ',
        value:``,
        validation:{
          required:true
        },
        valid:false
      }
    },
    edit:{
      shifts:false,
      startDate:false,
      endDate:false
    },
    show:{
      shifts: false
    },
    addInfoValid:false
  }

  componentDidMount(){
    this.props.onGetConfig();
  }

  componentWillUnmount(){
    this.props.onResetConfig();
  }

  toggleShowHandler = (el) => {
    this.setState((prevState)=>{
      return {show: {
          ...this.state.show,
          [el]:!prevState.show[el]
        }
      };
    });
  };

  toggleEditHandler = (el) => {
    this.setState((prevState)=>{
      return {
        edit: {
          ...this.state.edit,
          [el]:!prevState.edit[el]
        },
      };
    });
    if(el==='shifts'){
      this.setState({ addInfoValid:false,
        shiftsAdd:{
          ...this.state.shiftsAdd,
          name:{
            ...this.state.shiftsAdd.name,
            value:'',
            valid:false,
            changed:false,
          },
          schedule_start:{
            ...this.state.shiftsAdd.schedule_start,
            value:'00:00'
          },
          schedule_end:{
            ...this.state.shiftsAdd.schedule_end,
            value:'00:00'
          }
        }})
    }else if(el==='startDate' || el==='endDate'){
      this.setState({dates:{
        ...this.state.dates,
        [el]:{
          ...this.state.dates[el],
          value:'',
          valid:false
        }
      }})
    }
  };

  addShiftHandler = () => {
    const shiftInfo = {
      name: this.state.shiftsAdd.name.value,
      start: this.state.shiftsAdd.schedule_start.value,
      end: this.state.shiftsAdd.schedule_end.value
    }
    this.toggleEditHandler('shifts');
    this.props.onAddShift(shiftInfo);
  }

  editDatesHandler = (dateType,value) => {
    this.toggleEditHandler(dateType);
    this.props.onEditDates(dateType,value);
  }

  errorHandler = () =>{
    window.location.reload(false); 
  }

  changeInputHandler = (event,category,elemIdentifier) => {

    const updatedInfo ={
      ...this.state[category],
      [elemIdentifier]:{
        ...this.state[category][elemIdentifier],
        value: event.target.value,
        valid: this.validationHandler(this.state[category][elemIdentifier].validation, event.target.value),
        changed: true
      }
    }

    let infoIsValid = true;

    for (let elID in updatedInfo) {
      infoIsValid = updatedInfo[elID].valid && infoIsValid;
    }

    this.setState({[category]:updatedInfo,addInfoValid: category ==='shiftsAdd'?infoIsValid:false});
  }

  validationHandler(rules,value) {
    let isValid = true;

    if (!rules) {
        return true;
    }
    
    if (rules.required) {
        isValid = value.trim() !== '' && isValid;
    }

    return isValid;
}

  render(){
    let shifts = <Shifts
    scheduleConfig = {this.props.scheduleConfig}
    shiftsAdd = {this.state.shiftsAdd}
    showShifts = {this.state.show.shifts}
    editShifts = {this.state.edit.shifts}
    addInfoValid = {this.state.addInfoValid}
    toggleEdit = {this.toggleEditHandler.bind(this,'shifts')}
    toggleShow = {this.toggleShowHandler.bind(this,'shifts')}
    removeShift = {this.props.onRemoveShift}
    changeInput = {this.changeInputHandler}
    addShift = {this.addShiftHandler}/>

    
    let datesArray = [];
    let dates = null
    for(let el in this.state.dates){
      datesArray.push({...this.state.dates[el],id:el})
    }
    if(this.props.scheduleConfig){
      dates = datesArray.map(el =>(<EditItem
        key={el.id}
        title={el.id === 'startDate' ?'Start date : ' : 'End date : '}
        edit={this.state.edit[el.id]}
        inputInfo = {this.state.dates[el.id]}
        multipleInputCateg
        inputCateg = 'dates'
        changeInput = {this.changeInputHandler}
        value = {this.props.scheduleConfig[el.id]}
        toggleEdit = {this.toggleEditHandler.bind(this,el.id)}
        save = {this.editDatesHandler.bind(this,el.id,this.state.dates[el.id].value)}/>
        )
      )
    }

    let configInfo = (
      <>
      {shifts}
      {dates}
      </>
    )

    if(this.props.loading){
      configInfo = <div style={{margin:'auto'}}><Spinner/></div>
    }

    for(let el in this.props.error){
      if(this.props.error[el]){
        configInfo = <ErrorHandler
        errorText={el==='getConfig' ?'Unable to retrieve the schedule configuration from the server, please try again :(': 'Unable to make the requested schedule configuration changes, please try again :('}
        errorMsg={this.props.error[el]}
        btn btnClick={this.errorHandler}/>
      };
    };
    
    return (
      <div className={classes.ScheduleConfig}>
        {configInfo}
      </div>
    );
  };
};

const mapStateToProps = state => {
  return{
    scheduleConfig: state.config.schedule_config,
    loading: state.config.loading,
    error: state.config.error
  };
};

const mapDispatchToProps = dispatch => {
  return{
    onGetConfig: () => dispatch(actions.getConfig()),
    onResetConfig: () => dispatch(actions.resetConfig()),
    onAddShift: (configInfo) => dispatch(actions.addShift(configInfo)),
    onRemoveShift: (id) => dispatch(actions.deleteShift(id)),
    onEditDates: (dateType,value) => dispatch(actions.editDates(dateType,value))
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(ScheduleConfig);




// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



import React from 'react';

import classes from './Shifts.module.css';
import Input from '../../UI/Input/Input';
import Button from '../../UI/Button/Button';

const shifts = (props) => {
  let shiftsArray = [];
    if(props.scheduleConfig){
      if(props.scheduleConfig.shifts){
        for(let el in props.scheduleConfig.shifts){
          shiftsArray.push({...props.scheduleConfig.shifts[el],id:el})
        }
        shiftsArray = shiftsArray.sort((el1,el2) =>{
          if(el1.start){
            return el1.start.localeCompare(el2.start)
          }else return 0;
        });
      };
    };

  let shiftsAdd = [];
  for(let el in props.shiftsAdd){
    shiftsAdd.push(props.shiftsAdd[el]);
  }

  return(
    <div className={classes.Shifts}>
        <p>
          <strong>Shifts: </strong> 
          <Button btnType='Small Success' clicked={props.toggleEdit}>[add]</Button> 
          <Button btnType='Small Primary' clicked={props.scheduleConfig ? props.scheduleConfig.shifts ? props.toggleShow:null:null}>
            {props.scheduleConfig ? props.scheduleConfig.shifts ? props.showShifts ?'[hide]':'[show]' : '[empty]':'[empty]'}
          </Button>
        </p>

        {props.showShifts ? shiftsArray.map((el,i) => (
          <div className={classes.ShiftsShow} key={el.id}>
            <p 
              style={{margin:'4px 10px',fontSize:'17px'}} 
              >
            {i+1}. {el.name} : {el.start} - {el.end}
            </p>
            <Button 
              btnType='Small Danger'
              clicked={()=>props.removeShift(el.id)}>[x]</Button>
          </div>
          )
        ):null}

        {props.editShifts ? (
          <div style={{margin:'15px 0'}}>
            {shiftsAdd.map(el =>(<Input
              key={el.elemConfig.name}
              formElementType={el.elemType}
              attributes={el.elemConfig}
              options={el.options}
              value={el.value}
              label={el.label}
              isValid={!el.valid}
              isChanged={el.changed} inLine
              changed={(event)=>props.changeInput(event,'shiftsAdd',el.elemConfig.name)}/>))}
            <Button 
              btnType='Success' disabled={!props.addInfoValid}
              clicked={props.addShift}>Save</Button>
            <Button 
              btnType='Danger' 
              clicked={props.toggleEdit}>Cancel</Button>
          </div>
        ): null}
    </div>
  );
};

export default shifts;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let q = 0;
for(let i=startTime;i<endTime;i++){
  if(this.props.schConf.considerWeekends==='true'){
    if(time.format('d')==='0' || time.format('d')==='6'){
      myArray.push(i);
    }else{
      myArray.push(daysArray[q]);
      q++;
    }
  }else{
    myArray.push(daysArray[q]);
    q++;
  }
  time.add(1,'days');
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


<div className={classes.Item} key={el.id}>
<div style={{fontSize:'22px',color:'purple'}}>
  <strong>{`${j-1}. `}</strong>
  <em>{time.format('MMMM Do YYYY')}</em> 
</div>
<div >
  {this.state.edit[el.id] ?(
    <>
    {inputs.map(cur=>(
      <Input
      key={el.id+cur.id}
      formElementType={cur.elemType}
      attributes={cur.elemConfig}
      value={cur.value}
      isValid={!cur.valid}
      isChanged={cur.changed}
      options={cur.options}
      label={cur.label}
      changed={(event)=> this.changeInputDaysHandler(event,el.id,cur.id)}/>
    ))}
    <div style={{display:'flex',flexDirection:'column'}}>
      <Button btnType='Success' 
      clicked={this.allocateShiftHandler.bind(this,el.id,el.input.shift.value,el.input.nrEmpls.value)}
      disabled={!el.input.nrEmpls.valid}>Save</Button>
      <Button btnType='Danger' clicked={this.toggleDaysHandler.bind(this,el.id)}>Cancel</Button>
    </div>
    </>
  ) : shifts.map((cur,i) =>{
    
    if(cur.nr !== 0)n++;
    return cur.nr !== 0 ? (
      <>
      <p key={cur.value} style={{fontWeight:'bold',textAlign:'center'}}>{`${n}. ${cur.value} : {${cur.nr}}`}
      <Button btnType='Small Danger'
      clicked={this.allocateShiftHandler.bind(this,el.id,cur.value,0)}>x</Button>
      </p>
      </>
    ):null
  })}
</div>
<div style={{display:'flex',justifyContent:'space-between'}} >
  <FontAwesome className={classes.PlusIcon} name='plus-square' size='2x' onClick={this.toggleDaysHandler.bind(this,el.id)}>
    <div className={classes.PlusTT}>Add Shift</div>
  </FontAwesome>
  <FontAwesome className={classes.GetIcon} name='download' size='2x'>
    <div className={classes.GetTT}>Use Template</div>
  </FontAwesome>
  <FontAwesome className={classes.SaveIcon} name='save' size='2x'>
    <div className={classes.SaveTT}>Save Template</div>
  </FontAwesome>
</div>
</div>


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import React,{Component} from 'react';
import moment from 'moment';

import classes from './CalendarConfig.module.css';
import AllocationMain from '../../components/SchConfigItems/AllocationMain/AllocationMain';

class CalendarConfig extends Component{
  state={
    days:null,
    edit:{},
    add:{},
    user:{}
  }

  componentDidMount(){
    
    if(!this.props.schConf.days){
      let shiftsArray = [];
      for(let el in this.props.schConf.shifts){
        shiftsArray.push(this.props.schConf.shifts[el])
      }

      let shfts = {};
      let  opts = [];
      shiftsArray.forEach(el =>{
        shfts[el.name] = {value:`${el.start} - ${el.end}`,nr:0};
        opts.push(`${el.start} - ${el.end}`);
      })

      let days = {};
      
      for(let i=1; i<=31;i++){
        days[`day${i}`]={
          shifts:shfts,
          input:{
            shift:{
              elemType:'select',
              elemConfig: {
                name:`configDay${i}`,
                id:`configDay${i}`
              },
              label:'Shift : ',
              options: opts,
              value: opts[0],
              validation:{
                required:true
              },
              valid:true
            },
            nrEmpls:{
              elemType:'input',
              elemConfig: {
                type:'text',
                placeholder:'Employee Number',
                name:`configEmplNr${i}`,
                id:`configEmplNr${i}`
              },
              label:'Nr : ',
              value:``,
              validation:{
                required:true,
                isNumeric:true
              },
              valid:false,
              changed:false
            }
          },
          templates: {
            add:{
              elemType:'input',
              elemConfig: {
                type:'text',
                placeholder:'Template Name',
                name:`templAdd${i}`,
                id:`templAdd${i}`
              },
              label:'Template Name : ',
              value:'',
              validation:{
                required:true
              },
              valid:false,
              changed: false
            },
            use:{
              elemType:'select',
              elemConfig: {
                name:`useTempl${i}`,
                id:`useTempl${i}`
              },
              label:'Select Template : ',
              options: null,
              value: '',
              validation:{
                required:true
              },
              valid:true
            }
          }
        }
      }
      
      this.props.editItems('days',days)
    }else{
      this.setState({days:this.props.schConf.days})
    }
    
  }

  componentDidUpdate(prevProps){
    if(JSON.stringify(this.props.schConf.days)!==JSON.stringify(prevProps.schConf.days)){
      
      this.setState({days:this.props.schConf.days})
    }
  }

  toggleDaysHandler = (dayName) => {
    this.setState(prevState => {
      return {
        edit: {
          ...this.state.edit,
          [dayName]:!prevState.edit[dayName]
        },
        days:{
          ...this.state.days,
          [dayName]:{
            ...this.state.days[dayName],
            input:{
              ...this.state.days[dayName].input,
              nrEmpls:{
                ...this.state.days[dayName].input.nrEmpls,
                changed:false,
                valid:false,
                value:''
              },
              shift:{
                ...this.state.days[dayName].input.shift,
                value:this.state.days[dayName].input.shift.options[0]
              }
            }
          }
        }
      }
    })
  }

  changeInputDaysHandler = (event,category,elemIdentifier) => {

    const updatedInfo ={
      ...this.state.days,
      [category]:{
        ...this.state.days[category],
        input:{
          ...this.state.days[category].input,
          [elemIdentifier]:{
            ...this.state.days[category].input[elemIdentifier],
            value: event.target.value,
            valid: this.validationHandler(this.state.days[category].input[elemIdentifier].validation, event.target.value),
            changed: true
          }
        }
      }
    }
    
    this.setState({days:updatedInfo});
  }

  validationHandler(rules,value) {
    let isValid = true;
    if (!rules) {
        return true;
    }
    if (rules.required) {
        isValid = value.trim() !== '' && isValid;
    }
    if (rules.isNumeric) {
      const pattern = /^\d+$/;
      isValid = pattern.test(value) && isValid
    }
    return isValid;
  } 

  allocateShiftHandler = (dayName,shiftValue,value) => {
    let shiftName = '';
    for(let el in this.state.days[dayName].shifts){
      if(this.state.days[dayName].shifts[el].value === shiftValue){
        shiftName = el;
      }
    }

    if(value!==0){
      this.toggleDaysHandler(dayName);
    }
    
    this.props.allocateShift(dayName,shiftName,{value:shiftValue,nr:value});
  }
  
  render(){
    let time = moment(this.props.schConf.startDate);
    let startTime = 7 + Number(time.format('d'));
    let endTime = startTime + Number(this.props.schConf.nrDays);

    let myArray = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    
    let daysArray = [];
    if(this.state.days){
      for(let el in this.state.days){
        daysArray.push({...this.state.days[el],id:el})
      }
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

    time = moment(this.props.schConf.startDate);
    time=time.subtract(Number(time.format('d')),'days');
    let j =1;
    
    return(
      <div className={classes.Container}>
        {this.state.days ? myArray.map((el,i) =>{
          if(i>7)time=time.add(1,'days')
          
          return i>= startTime && i<endTime ? 
          this.props.schConf.considerWeekends ==='true'
          ? time.format('d') !=='6' && time.format('d') !=='0'
          ? j++ && (
           <AllocationMain
            key={el.id}
            el = {el} 
            j={j}
            time={time.format('MMMM Do')}
            edit = {this.state.edit[el.id]}
            changeInputDays = {this.changeInputDaysHandler}
            allocateShift = {this.allocateShiftHandler}
            toggleDays = {this.toggleDaysHandler.bind(this,el.id)}
            loadAlloc={this.props.loadAlloc}
            errorAloc={this.props.errorAlloc}/>
          ) :(
            <div className={classes.Weekends} key={el+i}>
              {time.format('MMMM Do')}
            </div>
          ) : j++ && (
            <AllocationMain
            key={el.id}
            el = {el} 
            j={j}
            time={time.format('MMMM Do')}
            edit = {this.state.edit[el.id]}
            changeInputDays = {this.changeInputDaysHandler}
            allocateShift = {this.allocateShiftHandler}
            toggleDays = {this.toggleDaysHandler.bind(this,el.id)}
            loadAlloc={this.props.loadAlloc}
            errorAloc={this.props.errorAlloc}/>
          ) : i<7 ? (
            <div  className={classes.Header} key={el+i}>
              {el}
            </div>
          ) : (
            <div className={classes.Inactive} key={el+i}>
              {time.format('MMMM Do')}
            </div>
          )
        }):null}
      </div>
    );
  };
};

export default CalendarConfig;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export const getEmpls = (recipient1,recipient2) => {
  return dispatch => {
  
   axios({
     method:'get',
     url:'/employees_test.json'
   }).then(res =>{
     for (let empl in res.data){
       res.data[empl].identifier = empl
     }
     dispatch(endGetEmpls(res.data));
     if(recipient1==='changeRemove' ||(recipient1==='scheduleConfig' && recipient2 ==='account')) {
       dispatch(actions.endChangeRemove());
     }else if(recipient1==='scheduleConfig'){
       dispatch(actions.endConfigLoading())
     }
   }).catch(err=>{
     if(typeof recipient1 === 'undefined'){
       dispatch(errorGetEmpls(err.message));
     }
     if(recipient1==='changeRemove' ||(recipient1==='scheduleConfig' && recipient2 ==='account')){
       dispatch(actions.errorChangeRemove(err.message));
     }else if(recipient1==='scheduleConfig' && typeof recipient2==='undefined'){
       dispatch(actions.errorGetConfig(err.message))
     }
   })
  };
};

export const getConfig = (recipient) => {
  return dispatch => {
    if(typeof recipient === 'undefined'){
      dispatch(startConfig());
    }

    if(recipient ==='account' ){
      dispatch(actions.startChangeRemove());
    }

    if(recipient==='employees'){
      dispatch(actions.startGetEmpls());
    }
    
    axios({
      method:'get',
      url:'/schedule_config.json'
    }).then(res => {
      dispatch(endGetConfig(res.data));
      if(recipient==='account' || typeof recipient === 'undefined'){
        dispatch(actions.getEmpls('scheduleConfig',recipient));
      }
      if(recipient==='w/empl'){
        dispatch(endConfigLoading());
      }
      if(recipient==='allocation'){
        dispatch(endAllocation());
      }
      if(recipient==='employees'){
        dispatch(actions.getEmpls())
      }
      if(recipient==='schedule'){
        dispatch(actions.getEmpls())
      }
    }).catch(err => {
      if(typeof recipient === 'undefined' || recipient==='allocation'){
        dispatch(errorGetConfig(err.message))
      }
      if(recipient==='account'){
        dispatch(actions.errorChangeRemove(err.message));
      }
      if(recipient==='employees'){
        dispatch(actions.errorGetEmpls(err.message))
      }
    })
  };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let total = 0;
for(let shift in shifts){
  total = total + Number(shifts[shift].nr);
}
if(total===0 || !this.props.employees){day='empty'};
