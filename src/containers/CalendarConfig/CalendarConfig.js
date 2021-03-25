import React,{Component} from 'react';
import moment from 'moment';

import classes from './CalendarConfig.module.css';
import AllocationMain from '../../components/SchConfigItems/AllocationMain/AllocationMain';

class CalendarConfig extends Component{
  state={
    addShift:null,
    templates:null,
    edit:{},
    editTemp:{},
    showDays:{}
  }

  //On mount the state elements that contain info about input field creation or calendar manipulation are created.
  //If there is no calendar information present on the server, it is created and added. The information is formed by day objects,each day of the calendar has an object representing a shift which contains the interval of the shift and the number of employees for that shift(which is 0 at creation but can be changed by the user)
  componentDidMount(){
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

    let optsTempName = [];
    if(this.props.schConf.templates){
      for(let el in this.props.schConf.templates){
        optsTempName.push(el);
      };
    };
    
    
    if(!this.props.schConf.days){

      let days = {};
      
      for(let i=1; i<=31;i++){
        days[`day${i}`]= {
          shifts:shfts,
          useTemp: false
        };
      }
      
      this.props.editItems('days',days)
    }

    let addShift ={};
    let templates = {};
    let edit = {};
    let editTemp ={add:{},use:{},remove:{}};
    let showDays = {};

    for(let i=1;i<=31;i++){
      addShift[`day${i}`] = {
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
          warning:`Needs to be a number with the addition of which, the total number of employees(${this.props.totalEmpls}) isn't exceeded for this day`,
          label:'Nr : ',
          value:``,
          validation:{
            required:true,
            isNumeric:true,
            maxNumber:true
          },
          valid:false,
          changed:false
        }
      }

      templates[`day${i}`] = {
        add:{
          elemType:'input',
          elemConfig: {
            type:'text',
            placeholder:'Template Name',
            name:`templAdd${i}`,
            id:`templAdd${i}`
          },
          warning:'At least 1 character required',
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
          options: optsTempName,
          value: optsTempName.length>0 ? optsTempName[0] : '',
          validation:{
            required:true
          },
          valid:true
        }
      }

      edit[`day${i}`] = false;

      editTemp.add[`day${i}`] = false;
      editTemp.use[`day${i}`] = false;
      editTemp.remove[`day${i}`] = false;
      showDays[`day${i}`] = false;
    }
    this.setState({addShift:addShift,templates:templates,edit:edit,editTemp:editTemp,showDays:showDays})
  }

  //If template information is changed by the user, the state info necessary for select field creation related to templates is updated.
  componentDidUpdate = (prevProps,prevState) => {
    
    if(prevProps.schConf){
        if(JSON.stringify(this.props.schConf.templates)!==JSON.stringify(prevProps.schConf.templates)){
          let optsTempName = [];
          if(this.props.schConf.templates){
            for(let el in this.props.schConf.templates){
              optsTempName.push(el);
            };
          };

          let templates = {};
          for(let i=1;i<=31;i++){
            templates[`day${i}`] = {
              ...this.state.templates[`day${i}`],
              use:{
                ...this.state.templates[`day${i}`].use,
                options: optsTempName,
                value: optsTempName.length>0 ? optsTempName[0] : '',
              }
            };
          };

          this.setState({templates:templates})
        }
      
    }
  }

  toggleShowHandler = (dayName) => {
    this.setState(prevState =>{
      return{
        showDays:{
          ...this.state.showDays,
          [dayName]:!this.state.showDays[dayName]
        }
      }
    })
  }

  // The state info regarding the input fields is reset when changing modes from view to edit or viceversa.
  toggleDaysHandler = (dayName) => {
    this.setState(prevState => {
      return {
        edit: {
          ...this.state.edit,
          [dayName]:!prevState.edit[dayName]
        },
        addShift:{
          ...this.state.addShift,
          [dayName]:{
            ...this.state.addShift[dayName],
            nrEmpls:{
              ...this.state.addShift[dayName].nrEmpls,
              changed:false,
              valid:false,
              value:''
            },
            shift:{
              ...this.state.addShift[dayName].shift,
              value:this.state.addShift[dayName].shift.options[0]
            }
          }
        }
      }
    })
  }

  toggleTempHandler = (type,dayName) => {
    this.setState(prevState => {
      return {
      editTemp:{
        ...this.state.editTemp,
        [type]:{
          ...this.state.editTemp[type],
          [dayName]:!prevState.editTemp[type][dayName]
        }
      }
    }})

    if(type==='add'){
      this.setState({
        templates:{
          ...this.state.templates,
          [dayName]:{
            ...this.state.templates[dayName],
            add:{
              ...this.state.templates[dayName].add,
              value:'',
              valid:false,
              changed:false
            }
          }
        }
      })
    }

    if(type==='use'){
      this.setState({
        templates:{
          ...this.state.templates,
          [dayName]:{
            ...this.state.templates[dayName],
            use:{
              ...this.state.templates[dayName].use,
              value: this.state.templates[dayName].use.options.length > 0 ? this.state.templates[dayName].use.options[0] : ''
            }
          }
        }
      })
    }
  }

  //Method attached to the onChange event of each input field. It copies the value from the input field to the corresponding state object and checks if the value is valid.
  changeInputDaysHandler = (event,category,elemIdentifier) => {
    const updatedInfo ={
      ...this.state.addShift,
      [category]:{
        ...this.state.addShift[category],
        [elemIdentifier]:{
          ...this.state.addShift[category][elemIdentifier],
          value: event.target.value,
          valid: this.validationHandler(this.state.addShift[category][elemIdentifier].validation, event.target.value,category),
          changed: true
        }
      }
    }
    this.setState({addShift:updatedInfo});
  }

  changeInputTempHandler = (event,category,elemIdentifier) =>{
    const updatedInfo = {
      ...this.state.templates,
      [category]:{
        ...this.state.templates[category],
        [elemIdentifier]:{
          ...this.state.templates[category][elemIdentifier],
          value: event.target.value,
          valid: this.validationHandler(this.state.templates[category][elemIdentifier].validation,event.target.value,category),
          changed: true
        }
      }
    }
    this.setState({templates:updatedInfo});
  }

  //Rules for validation, each state object on which the input field is rendered has at least one rule. 
  validationHandler(rules,value,dayName) {
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

    if (rules.maxNumber){
      let curEmpls = 0;
      for(let shift in this.props.schConf.days[dayName].shifts){
        curEmpls= curEmpls + Number(this.props.schConf.days[dayName].shifts[shift].nr);
      }
      
      isValid = Number(value) + curEmpls <= this.props.totalEmpls && isValid;
    }

    return isValid;
  } 

  //Method used when adding a shift, it sends the information to the server and resets the input fields
  allocateShiftHandler = (dayName,shiftValue,value) => {
    let shiftName = '';
    for(let el in this.props.schConf.days[dayName].shifts){
      if(this.props.schConf.days[dayName].shifts[el].value === shiftValue){
        shiftName = el;
      }
    }

    if(value!==0){
      this.toggleDaysHandler(dayName);
    }
    
    this.props.allocateShift(dayName,shiftName,{value:shiftValue,nr:value});
  }

  //An array of objects holds the information on which the schedule is rendered. Each element of the array represents a day. Each day can be either a working day, non schedule day(outside the config interval) or weekend.
  //A working day contains information regarding the shift an how many employees are on that shift. This info is taken from the schedule from the server.
  //A non schedule day or a weekend day contains a random number
  //Moment library is used to acertain the type of a day. Each day has a different style and only the working days contain relevant info
  render(){
    let time = moment(this.props.schConf.startDate);
    let startTime = 7 + Number(time.format('d'));
    let endTime = startTime + Number(this.props.schConf.nrDays);

    let myArray = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    
    let daysArray = [];
    if(this.state.addShift){
      for(let el in this.state.addShift){
        daysArray.push({
          input:this.state.addShift[el],
          shifts:this.props.schConf.days[el].shifts,
          useTemp: this.props.schConf.days[el].useTemp,
          allTemps: this.props.schConf.templates,
          template:this.state.templates[el],
          id:el})
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
      <div className={this.props.expand ? classes.ContainerExp :classes.Container}>
        {this.state.addShift ? myArray.map((el,i) =>{
          if(i>7)time=time.add(1,'days')
          
          return i>= startTime && i<endTime ? 
          this.props.schConf.considerWeekends ==='true'
          ? time.format('d') !=='6' && time.format('d') !=='0'
          ? j++ && (
           <AllocationMain
            key={el.id}
            el = {el} 
            j={j}
            totalEmpls = {this.props.totalEmpls}
            time={time.format('MMMM Do')}
            timeMin={time.format('MMM Do')}
            expand={this.props.expand}
            showDay ={this.state.showDays[el.id]}
            toggleShowDay={this.toggleShowHandler.bind(this,el.id)}
            edit = {this.state.edit[el.id]}
            editTempAdd = {this.state.editTemp.add[el.id]}
            editTempUse = {this.state.editTemp.use[el.id]}
            editTempRemove ={this.state.editTemp.remove[el.id]}
            changeInputDays = {this.changeInputDaysHandler}
            changeInputTemp = {this.changeInputTempHandler}
            allocateShift = {this.allocateShiftHandler}
            addTemplate = {this.props.addTemplate}
            useTemplate = {this.props.useTemplate}
            toggleDays = {this.toggleDaysHandler.bind(this,el.id)}
            toggleTemp = {this.toggleTempHandler}
            loadAlloc={this.props.loadAlloc}
            errorAloc={this.props.errorAlloc}
            resetConfigError={this.props.resetConfigError}/>
          ) :(
            <div className={this.props.expand ? classes.WeekendsExp :classes.Weekends} key={`${i}${el.id}`}>
              {time.format('MMM Do')}
            </div>
          ) : j++ && (
            <AllocationMain
            key={el.id}
            el = {el} 
            j={j}
            totalEmpls = {this.props.totalEmpls}
            time={time.format('MMMM Do')}
            timeMin={time.format('MMM Do')}
            expand={this.props.expand}
            showDay ={this.state.showDays[el.id]}
            toggleShowDay={this.toggleShowHandler.bind(this,el.id)}
            edit = {this.state.edit[el.id]}
            editTempAdd = {this.state.editTemp.add[el.id]}
            editTempUse = {this.state.editTemp.use[el.id]}
            editTempRemove ={this.state.editTemp.remove[el.id]}
            changeInputDays = {this.changeInputDaysHandler}
            changeInputTemp = {this.changeInputTempHandler}
            allocateShift = {this.allocateShiftHandler}
            addTemplate = {this.props.addTemplate}
            useTemplate = {this.props.useTemplate}
            toggleDays = {this.toggleDaysHandler.bind(this,el.id)}
            toggleTemp = {this.toggleTempHandler}
            loadAlloc={this.props.loadAlloc}
            errorAloc={this.props.errorAlloc}
            resetConfigError={this.props.resetConfigError}/>
          ) : i<7 ? (
            <div  className={classes.Header} key={el+i}>
              {el}
            </div>
          ) : (
            <div className={this.props.expand? classes.InactiveExp : classes.Inactive} key={el+i}>
              {time.format('MMM Do')}
            </div>
          )
        }):null}
      </div>
    );
  };
};

export default CalendarConfig;