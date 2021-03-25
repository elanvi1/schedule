import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Route} from 'react-router-dom';
import asyncComponent from '../../hoc/asyncComponent/asyncComponent';

import classes from './ScheduleConfig.module.css';
import Spinner from '../../components/UI/Spinner/Spinner';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';
import * as actions from '../../store/actions/index';
import ItemAddShow from '../../components/SchConfigItems/ItemAddShow/ItemAddShow';
import EditItem from '../../components/EditItem/EditItem';
import Modal from '../../components/UI/Modal/Modal';
import Button from '../../components/UI/Button/Button';
import * as globalVariables from '../../globalVariables';

// The components are imported async when used in order to ease the process by not downloading components the user might not use
const AsyncTemplates = asyncComponent(()=> import('../../components/SchConfigItems/Templates/Templates'));
const AsyncCalendarConfig = asyncComponent(() => import('../CalendarConfig/CalendarConfig'));

//There are 8 elements present in ScheduleConfig: Shifts, Absences, Start Date, Number of days, Shifts per Week, Consider Weekends, Allocation and Templates
// Shifts and absences are rendered via the ItemsAddShow component
// Start Date, Number of days, Shifts per Week and Consider Weekends are rendered by EditItem component
// Allocation is rendered via CalendarConfig component
// Templates are rendered via Templates component

class ScheduleConfig extends Component {
  // The state contains properties that help manipulate the elements and info that help render the input or select fields of the elements
  state ={
    itemsAddRemove:{
      shifts:{
        name:{
          elemType:'input',
          elemConfig: {
            type:'text',
            placeholder:'Name',
            name:'shiftName',
            id:'shiftName'
          },
          warning:'At least 1 character required',
          label:'Name : ',
          value:'',
          validation:{
            required:true
          },
          valid:false,
          changed: false
        },
        start:{
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
        end:{
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
        }
      },
      absences:{
        name:{
          elemType:'selectConfig',
          elemConfig: {
            name:'absenceName',
            id:'absenceName'
          },
          label:'Name : ',
          value:'',
          options:null,
          validation:{
            required:true
          },
          valid:false,
          changed: false
        },
        start:{
          elemType:'input',
          elemConfig: {
            type:'date',
            name:'absenceStartDate',
            id:'absenceStartDate'
          },
          label:'Start date : ',
          value:``,
          validation:{
            required:true
          },
          valid:false,
        },
        end:{
          elemType:'input',
          elemConfig: {
            type:'date',
            name:'absenceEndDate',
            id:'absenceEndDate'
          },
          label:'End date : ',
          value:``,
          validation:{
            required:true
          },
          valid:false,
        },
      }
    },
    editItems:{
      startDate:{
        elemType:'input',
        elemConfig: {
          type:'date',
          name:'startDate',
          id:'startDate'
        },
        label:'Start date : ',
        value:``,
        validation:{
          required:true
        },
        valid:false,
      },
      nrDays:{
        elemType:'input',
        elemConfig: {
          type:'text',
          placeholder:'Duration Number',
          name:'nrDays',
          id:'nrDays'
        },
        warning:'Needs to be a number between 1 and 31',
        label:'Number of Days : ',
        value:``,
        validation:{
          required:true,
          isNumericMax:true
        },
        valid:false
      },
      shiftsPerWeek:{
        elemType:'input',
        elemConfig: {
          type:'text',
          placeholder:'Enter Number',
          name:'shiftsPerWeek',
          id:'shiftsPerWeek'
        },
        warning:'Needs to be a number',
        label:'Shifts Per Week : ',
        value:``,
        validation:{
          required:true,
          isNumeric: true
        },
        valid:false,
        changed:false
      },
      considerWeekends:{
        elemType:'select',
        elemConfig: {
          name:'considerWeekends',
          id:'considerWeekends'
        },
        options:['false','true'],
        label:'Consider Weekends : ',
        value:'false',
        validation:{
          required:true
        },
        valid:true
      }
    },
    templates:{},
    editTemps:{},
    edit:{
      absences:false,
      shifts:false,
      startDate:false,
      nrDays:false,
      considerWeekends:false,
      shiftsPerWeek:false,
    },
    show:{
      shifts: false,
      absences:false,
      warning:false,
      templates:false,
      expandedAlloc:false,
      warningDelAlloc:false
    },
    shiftsInfoValid:false,
    absencesInfoValid:false,
    warningItem:'zzzzzzz'
  }

  //On mount the config and employees is retrieved from the server
  componentDidMount(){
    this.props.onGetConfig();
  }

  componentDidUpdate(prevProps,prevState){
    //After the information is retrieved on mount, the state object with info about absences input fields is created dynamcally as the employees are not predefined.
    if(this.props.employees && !this.state.itemsAddRemove.absences.name.options){
      let emplArray = this.getEmplNamesArray();

      this.setState({itemsAddRemove:{
        ...this.state.itemsAddRemove,
        absences:{
          ...this.state.itemsAddRemove.absences,
          name:{
            ...this.state.itemsAddRemove.absences.name,
            options:emplArray.map(el=>{
              return {name:el.name,userId:el.identifier}
            }),
            value: emplArray[0].name + '___' + emplArray[0].identifier,
            valid:true
          }
        }
      }})
    }
    
    // Each time the user wants to change start date, number of days, consider weekends or shifts per week a modal is shown informing him that this will reset other elements(schedule and or allocation)
    //The piece of code below helps identify for which element to show the modal
    if(this.state.edit.startDate!==prevState.edit.startDate || this.state.edit.nrDays!==prevState.edit.nrDays || this.state.edit.considerWeekends!==prevState.edit.considerWeekends || this.state.edit.shiftsPerWeek!==prevState.edit.shiftsPerWeek){
      for(let el in this.state.edit){
        if((el==='startDate'|| el ==='nrDays' || el ==='considerWeekends' || el ==='shiftsPerWeek') && this.state.edit[el]!==prevState.edit[el]){
          this.setState({warningItem:el})
        }
      }
    }

    //The state info for rendering templates input fields and for template manipulation is being created dynamically as templates are not predefined. A additiion or substraction of a template will trigger a creation.
    if(this.props.scheduleConfig){
      if(this.props.scheduleConfig.templates){
        let arg = {};
        if(prevProps.scheduleConfig){
          if(prevProps.scheduleConfig.templates){
            arg=prevProps.scheduleConfig.templates
          }
        }
        if(!prevProps.scheduleConfig ||(Object.keys(this.props.scheduleConfig.templates).length !== Object.keys(arg).length)){
          let templates = {};
          let shiftsArray = [];
          

          for(let el in this.props.scheduleConfig.shifts){
            shiftsArray.push(this.props.scheduleConfig.shifts[el])
          }

          let  opts = [];
          shiftsArray.forEach(el =>{
            opts.push(`${el.start} - ${el.end}`);
          })

          let editTemps ={...this.state.edit}
          let showDelTemps={...this.state.show};

          for(let el in this.props.scheduleConfig.templates){
            templates[el] = {
              shift:{
                elemType:'select',
                elemConfig: {
                  name:`${el}Shift`,
                  id:`${el}Shift`
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
                  name:`${el}Nr`,
                  id:`${el}Nr`
                },
                warning:`Needs to be a number with the addition of which, the total number of employees isn't exceeded for this template`,
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
            editTemps[el]=false;
            showDelTemps[el]=false;
          }

          this.setState({templates:templates,edit:editTemps,show:showDelTemps})
        }
      }
    }

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

  // The state info regarding the input fields is reset when changing modes from view to edit or viceversa. If a modal is triggered by such a change, the state info regarding it's showing is also changed.
  toggleEditHandler = (el,noWarning) => {
    this.setState((prevState)=>{
      return {
        edit: {
          ...this.state.edit,
          [el]:!prevState.edit[el]
        },
      };
    });
    if(el==='shifts'){
      this.setState({ shiftsInfoValid:false,
        itemsAddRemove:{
          ...this.state.itemsAddRemove,
          shifts:{
            ...this.state.itemsAddRemove.shifts,
            name:{
              ...this.state.itemsAddRemove.shifts.name,
              value:'',
              valid:false,
              changed:false,
            }
          }
        }})
    }else if(el==='startDate'||el==='nrDays'||el==='shiftsPerWeek'){
      this.setState(prevState =>{
        return {editItems:{
          ...this.state.editItems,
          [el]:{
            ...this.state.editItems[el],
            value:'',
            valid:false,
            changed:false
          }
        },
        show:{
          ...this.state.show,
          warning: noWarning===true ? false: !prevState.show.warning
        }
        }
      })
    }else if(el==='absences'){
      this.setState({absencesInfoValid:false,
        itemsAddRemove:{
        ...this.state.itemsAddRemove,
        absences:{
          ...this.state.itemsAddRemove.absences,
          start:{
            ...this.state.itemsAddRemove.absences.start,
            value:'',
            valid:false,
            changed:false
          },
          end:{
            ...this.state.itemsAddRemove.absences.end,
            value:'',
            valid:false,
            changed:false
          }
        }
      }})
    }else if(el==='considerWeekends'){
      this.setState(prevState => {
        return {editItems:{
          ...this.state.editItems,
          [el]:{
            ...this.state.editItems[el],
            value:'false',
          }
        },
        show:{
          ...this.state.show,
          warning: noWarning===true ? false: !prevState.show.warning
        }
      }})
    }
  };

  editTempsHandler = (el) => {
    this.setState((prevState)=>{
      return {
        edit: {
          ...this.state.edit,
          [el]:!prevState.edit[el]
        },
        templates:{
          ...this.state.templates,
          [el]:{
            ...this.state.templates[el],
            nrEmpls:{
              ...this.state.templates[el].nrEmpls,
              changed:false,
              valid:false,
              value:''
            },
            shift:{
              ...this.state.templates[el].shift,
              value:this.state.templates[el].shift.options[0]
            }
          }
        }
      };
    });
  }

  getEmplNamesArray = () => {
    let emplArray =[];

    for(let empl in this.props.employees){
      emplArray.push(this.props.employees[empl])
    }

    emplArray = emplArray.sort((el1,el2) => {
      if(el2){
        return el1.name.localeCompare(el2.name)
      }else{
        return 0;
      }
    })

    return emplArray;
  }

  //Method triggered when adding a shift or an absence. It sends the info to the server and resets the input fields.
  addInfoHandler = (type) => {
    let itemInfo = null;
    if(type==='shifts'){
      itemInfo = {
        name: this.state.itemsAddRemove.shifts.name.value,
        start: this.state.itemsAddRemove.shifts.start.value,
        end: this.state.itemsAddRemove.shifts.end.value
        }
      
      this.setState({
        shiftsInfoValid:false,
        itemsAddRemove:{
          ...this.state.itemsAddRemove,
          shifts:{
            ...this.state.itemsAddRemove.shifts,
            start:{
              ...this.state.itemsAddRemove.shifts.start,
              value:'00:00'
            },
            end:{
              ...this.state.itemsAddRemove.shifts.end,
              value:'00:00'
            },
            name:{
              ...this.state.itemsAddRemove.shifts.name,
              value:'',
              valid:false,
              changed:false,
            }
          }
        }
      })
    }else if(type==='absences'){
      let info= this.state.itemsAddRemove.absences.name.value.split('___');

      itemInfo = {
        name: info[0],
        start: this.state.itemsAddRemove.absences.start.value,
        end: this.state.itemsAddRemove.absences.end.value,
        userId:info[1]
      }

      this.setState({
        absencesInfoValid:false,
        itemsAddRemove:{
          ...this.state.itemsAddRemove,
          absences:{
            ...this.state.itemsAddRemove.absences,
            name:{
              ...this.state.itemsAddRemove.absences.name,
              value: this.getEmplNamesArray()[0].name + '___' + this.getEmplNamesArray()[0].identifier
            },
            start:{
              ...this.state.itemsAddRemove.absences.start,
              value:'',
              valid:false,
              changed:false
            },
            end:{
              ...this.state.itemsAddRemove.absences.end,
              value:'',
              valid:false,
              changed:false
            }
          }
        }
      })
    }
     
    this.props.onAddInfo(type,itemInfo);
  }

  //Method triggered when removing a shift or an absence. It delets info from the server and resets the input fields.
  removeInfoHandler = (type,id) => {
    if(type==='shifts'){
      this.setState({
        itemsAddRemove:{
          ...this.state.itemsAddRemove,
          shifts:{
            ...this.state.itemsAddRemove.shifts,
            start:{
              ...this.state.itemsAddRemove.shifts.start,
              value:'00:00'
            },
            end:{
              ...this.state.itemsAddRemove.shifts.end,
              value:'00:00'
            }
          }
        }
      })
    }else if(type==='absences'){
      this.setState({
        itemsAddRemove:{
          ...this.state.itemsAddRemove,
          absences:{
            ...this.state.itemsAddRemove.absences,
            name:{
              ...this.state.itemsAddRemove.absences.name,
              value: this.getEmplNamesArray()[0].name + '___' + this.getEmplNamesArray()[0].identifier
            }
          }
        }
      })
    }

    this.props.onRemoveInfo(type,id);
  }

  //Method triggered when changin number of days, start date, consider weekends or shifts per week. It sends the new info to the server and resets input fields
  editItemsHandler = (dateType,value) => {
    this.toggleEditHandler(dateType,true);
    this.props.onEditItems(dateType,value);
  }

  //Dispatches an action that sets the value of error from the scheduleConfig reducer to null and fetches the empls and config info from the server
  errorHandler = () =>{
    this.props.onResetConfigError();
  }

  //Method attached to the onChange event of each input field. It copies the value from the input field to the corresponding state object and checks if the value is valid or in the case of multiple values checks if all the values corresponding to the element in question are valid.
  changeInputHandler = (event,category,elemIdentifier,secondCategory) => {
    let updatedInfo = {};
    if(secondCategory){
      updatedInfo={
        ...this.state[category],
        [secondCategory]:{
          ...this.state[category][secondCategory],
          [elemIdentifier]:{
            ...this.state[category][secondCategory][elemIdentifier],
            value: event.target.value,
            valid: this.validationHandler(this.state[category][secondCategory][elemIdentifier].validation, event.target.value,secondCategory),
            changed: true
          }
        }
      }
    }else{
      updatedInfo ={
        ...this.state[category],
        [elemIdentifier]:{
          ...this.state[category][elemIdentifier],
          value: event.target.value,
          valid: this.validationHandler(this.state[category][elemIdentifier].validation, event.target.value),
          changed: true
        }
      }
    }
      
    let infoIsValid = true;

    if(secondCategory){
      for(let elID in updatedInfo[secondCategory]){
        infoIsValid = updatedInfo[secondCategory][elID].valid && infoIsValid;
      }
    }else{
      for (let elID in updatedInfo) {
        infoIsValid = updatedInfo[elID].valid && infoIsValid;
      }
    }

    this.setState({
      [category]:updatedInfo,
      shiftsInfoValid: secondCategory ==='shifts'?infoIsValid:false,
      absencesInfoValid: secondCategory==='absences'?infoIsValid:false
    });
  }

  //Rules for validation, each state object on which the input field is rendered has at least one rule. 
  validationHandler(rules,value,tempName) {
    let isValid = true;

    if (!rules) {
        return true;
    }
    
    if (rules.required) {
        isValid = value.trim() !== '' && isValid;
    }

    if (rules.isNumeric) {
      const pattern = /^\d+$/;
      isValid = pattern.test(value)  && isValid
    }

    if (rules.isNumericMax) {
      const pattern = /^\d+$/;
      isValid = pattern.test(value) && value<=31 && isValid
    }

    if (rules.maxNumber){
      let totalEmpls = 0;
      let curEmpls = 0;

      if(this.props.employees){
        totalEmpls = Object.keys(this.props.employees).length;
      }
     
      for(let shift in this.props.scheduleConfig.templates[tempName]){
        curEmpls= curEmpls + Number(this.props.scheduleConfig.templates[tempName][shift].nr)
      }

      isValid = Number(value) + curEmpls <= totalEmpls && isValid
    }

    return isValid;
  }

  render(){
    let itemsAddRemoveArray = [];
    let itemsAddRemove = null;
    for(let el in this.state.itemsAddRemove){
      itemsAddRemoveArray.push({
        ...this.state.itemsAddRemove[el],
        id:el
      })
    }
    if(this.state.itemsAddRemove.absences.name.options)
    itemsAddRemove = itemsAddRemoveArray.map(el =><ItemAddShow
      key ={el.id}
      scheduleConfig = {this.props.scheduleConfig}
      inputInfo = {this.state.itemsAddRemove[el.id]}
      show = {this.state.show[el.id]}
      edit = {this.state.edit[el.id]}
      addInfoValid = {el.id==='shifts'? this.state.shiftsInfoValid : this.state.absencesInfoValid}
      type = {el.id}
      employees = {this.props.employees}
      toggleShow = {this.toggleShowHandler.bind(this,el.id)}
      toggleEdit = {this.toggleEditHandler.bind(this,el.id)}
      remove = {this.removeInfoHandler}
      changeInput = {this.changeInputHandler}
      addInfo = {this.addInfoHandler}/>)
    
    let editItemsArray = [];
    let editItems = null;
    for(let el in this.state.editItems){
      editItemsArray.push({...this.state.editItems[el],id:el})
    }
    if(this.props.scheduleConfig){
      editItems = editItemsArray.map(el =>(<EditItem
        key={el.id}
        title={this.state.editItems[el.id].label}
        edit={this.state.edit[el.id]}
        inputInfo = {this.state.editItems[el.id]}
        multipleInputCateg
        inputCateg = 'editItems'
        changeInput = {this.changeInputHandler}
        value = {this.props.scheduleConfig[el.id]}
        toggleEdit = {this.toggleEditHandler.bind(this,el.id)}
        save = {this.editItemsHandler.bind(this,el.id,this.state.editItems[el.id].value)}
        admin={true}/>
        )
      )
    }


    let templates = <AsyncTemplates
      scheduleConfig={this.props.scheduleConfig}
      tempsInput={this.state.templates}
      show={this.state.show}
      edit={this.state.edit}
      expAlloc={this.state.show.expandedAlloc}
      toggleShowTemps ={this.toggleShowHandler}
      toggleEditTemps ={this.editTempsHandler}
      changeInput ={this.changeInputHandler}
      allocateShiftTemplate={this.props.onAllocateShiftTemp}
      delTemp = {this.props.onDeleteTemplate}
      load={this.props.loadAlloc}
      error={this.props.errorAlloc}
      resetConfigError={this.props.onResetConfigError}/>;
    

    // In case all the information required for shift allocation isn't present a div is created showing what is missing.
    let allocationTitle = null;
    if(this.props.scheduleConfig){
      allocationTitle = (
      <div className={classes.AlocAndTemps}>{this.props.scheduleConfig.considerWeekends && this.props.scheduleConfig.nrDays && this.props.scheduleConfig.shifts && this.props.scheduleConfig.startDate ? (
        <>
        <strong>Allocation & templates :</strong>
        <div>
          <Button 
            btnType='Small Primary'
            clicked={() => this.props.history.push(this.props.match.url + '/AllocationAndTemplates')}>
            Go To
          </Button>
          <Button
            btnType='Small Danger'
            clicked={this.toggleShowHandler.bind(this,'warningDelAlloc')}>
            Delete
          </Button>
        </div>
        </>
      ) : <em>* Please fill in the following info in order to access shift alocation : {!this.props.scheduleConfig.considerWeekends? 'weekend consideration' : ''} {!this.props.scheduleConfig.nrDays ? 'number of days' : ''} {!this.props.scheduleConfig.shifts ? 'at least one shift':''} {!this.props.scheduleConfig.startDate ? 'start date' : ''}</em>}</div>
      )
    }

    let allocation = null;
    if(this.props.scheduleConfig){
      if(this.props.scheduleConfig.considerWeekends && this.props.scheduleConfig.nrDays && this.props.scheduleConfig.shifts && this.props.scheduleConfig.startDate){
        let totalEmpls = 0;
        if(this.props.employees){
          totalEmpls = Object.keys(this.props.employees).length;
        }
        
        allocation = <AsyncCalendarConfig 
          schConf={this.props.scheduleConfig}
          totalEmpls={totalEmpls}
          expand={this.state.show.expandedAlloc}
          editItems={this.props.onEditItems}
          allocateShift={this.props.onAllocation}
          loadAlloc={this.props.loadAlloc}
          errorAlloc={this.props.errorAlloc}
          addTemplate = {this.props.onAddTemplate}
          useTemplate ={this.props.onUseTemplate}
          resetConfigError = {this.props.onResetConfigError}
          />
      };
    };


    let warning = null;
    let text = '';
    
    if(this.state.warningItem==='startDate'){
      text = 'the starting date'
    }else if(this.state.warningItem==='nrDays'){
      text = 'the number of days'
    }else if(this.state.warningItem==='considerWeekends'){
      text = 'the weekend considerations'
    }else if(this.state.warningItem==='shiftsPerWeek'){
      text= 'the number of shifts per week'
    }
    
    // A modal that appears when changing certain elements that will cause a allocation and/or schedule reset
    warning = <Modal
      shouldShow={this.state.edit[this.state.warningItem] ?this.state.show.warning : false}
      closeModal={this.toggleEditHandler.bind(this,this.state.warningItem)}>
      <h4 style={{textAlign:'center'}}>Are you sure you want to proceed? Keep in mind that by changing {text}, {this.state.warningItem==='shiftsPerWeek' ?'the schedule will be deleted(not the allocations or templates)' :'the shift allocations will be deleted(not the templates)'}</h4>
      <Button btnType = 'Success'
        clicked={this.toggleShowHandler.bind(this,'warning')}>Yes</Button>
      <Button btnType = 'Danger'
        clicked={this.toggleEditHandler.bind(this,this.state.warningItem)}>No</Button>
    </Modal>

    // A modal that appears when trying to delete the allocation
    let warningDelAlloc = <Modal
        shouldShow={this.state.show.warningDelAlloc}
        closeModal={this.toggleShowHandler.bind(this,'warningDelAlloc')}>
      <h4 style={{textAlign:'center'}}>Are you sure you want to delete the shift allocations? Keep in mind that this will also delete the schedule</h4>
      <Button btnType = 'Success'
        clicked={() => {
          this.props.onDeleteAllocation()
          this.toggleShowHandler('warningDelAlloc')}}>Yes</Button>
      <Button btnType = 'Danger'
        clicked={this.toggleShowHandler.bind(this,'warningDelAlloc')}>No</Button>
    </Modal>



    let configInfo = window.location.pathname === (globalVariables.subfolder + this.props.match.url) ? (
      <>
      <h1 style={{textAlign:'center'}}>Configuration</h1>
      {itemsAddRemove}
      {editItems}
      {allocationTitle}
      {warning}
      {warningDelAlloc}
      </>
    ) : (
      <Route path={this.props.match.url + '/AllocationAndTemplates'} render={()=>(
        <>
        <h1 style={{textAlign:'center'}}>Shift allocations and Templates</h1>
        {templates}
        {allocation}
        </>
      )}/>
    )

    // Spinner show if loading prop from scheduleConfig reducer is true
    if(this.props.loading){
      configInfo = <div style={{margin:'auto'}}><Spinner/></div>
    }

    //ErrorHandler comp rendered if error from scheduleConfig reducer is a truthy value
    for(let el in this.props.error){
      if(this.props.error[el]){
        configInfo = <ErrorHandler
        errorText={el==='getConfig' ?'Unable to retrieve the schedule configuration from the server, please try again :(': el==='makeConfig'? 'Unable to make the requested schedule configuration changes, please try again :(' :
        el==='errorDelAlloc' ?'Unable to delete the allocations that were made, please try again and delete them using the delete allocations button' 
        : 'Unable to delete the schedule, please use the delete schedule button from the schedule page in order to delete the schedule so that a new one can be created with the current info'}
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
    error: state.config.error,
    loadAlloc: state.config.loadAlloc,
    errorAlloc: state.config.errorAlloc,
    employees: state.employees.employees
  };
};

const mapDispatchToProps = dispatch => {
  return{
    onGetConfig: () => dispatch(actions.getConfig()),
    onResetConfig: () => dispatch(actions.resetConfig()),
    onAddInfo: (type,configInfo) => dispatch(actions.addInfo(type,configInfo)),
    onRemoveInfo: (type,id) => dispatch(actions.deleteInfo(type,id)),
    onEditItems: (dateType,value) => dispatch(actions.editItems(dateType,value)),
    onAllocation: (dayName,shiftName,value) => dispatch(actions.allocation(dayName,shiftName,value)),
    onAddTemplate: (dayName,tempName,value) => dispatch(actions.addTemplate(dayName,tempName,value)),
    onAllocateShiftTemp: (tempName,shiftName,value) => dispatch(actions.allocateShiftTemplate(tempName,shiftName,value)),
    onDeleteTemplate: (tempName,payLoad) => dispatch(actions.deleteTemplate(tempName,payLoad)),
    onUseTemplate: (dayName,tempName) => dispatch(actions.useTemplate(dayName,tempName)),
    onDeleteAllocation: () => dispatch(actions.deleteAllocation(true)),
    onResetConfigError: () => dispatch(actions.resetConfigError())
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(ScheduleConfig);