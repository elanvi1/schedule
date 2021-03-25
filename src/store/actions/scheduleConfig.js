import * as actionTypes from '../actions/actionTypes';
import * as actions from './index';
import axios from '../../axios-instance';

const startConfig = () => {
  return {
    type:actionTypes.START_CONFIG
  };
};

const endGetConfig = (config) => {
  return {
    type:actionTypes.END_GET_CONFIG,
    config:config
  };
};

export const errorGetConfig = (err) => {
  return{
    type:actionTypes.ERROR_GET_CONFIG,
    errMsg:err
  };
};

export const endConfigLoading = () =>{
  return{
    type:actionTypes.END_CONFIG_LOAD
  };
};

const errorMakeConfig = (err) =>{
  return{
    type:actionTypes.ERROR_MAKE_CONFIG,
    errMsg:err
  };
};

const resetStandard = () =>{
  return{
    type:actionTypes.RESET_CONFIG
  };
}

export const resetConfig = () => {
  return dispatch => {
    dispatch(resetStandard());
    dispatch(actions.resetEmpls());
  }
};

//Method that makes an async request to the server via firebase rest api and using get method. In some cases when retrieving the config the employees info is also retreived.
export const getConfig = (recipient) => {
  return (dispatch,getState) => {
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
      url:`/schedule_config.json?auth=${getState().auth.token}`
    }).then(res => {
      dispatch(endGetConfig(res.data));
      
      if(typeof recipient === 'undefined'){
        dispatch(actions.getEmpls('scheduleConfig'));
      }
      if(recipient==='account' || recipient==='schedule'){
        dispatch(actions.getEmpls(recipient));
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
    }).catch(err => {
      if(typeof recipient === 'undefined' || recipient==='allocation' || recipient==='w/empl'){
        dispatch(errorGetConfig(err.response.statusText))
      }
      if(recipient==='account'){
        dispatch(actions.errorChangeRemove(err.response.statusText));
      }
      if(recipient==='employees'){
        dispatch(actions.errorGetEmpls(err.response.statusText));
      }
      if(recipient==='schedule'){
        dispatch(actions.errorGetSchedule(err.response.statusText));
      }
    })
  };
};

export const addInfo = (type,shiftInfo) =>{
  return (dispatch,getState) => {
    dispatch(startConfig());
    axios({
      method:'post',
      url:`/schedule_config/${type}.json?auth=${getState().auth.token}`,
      data:shiftInfo
    }).then(res => {
      if(type==='shifts'){
        dispatch(deleteAllocation());
      }else{
        dispatch(deleteSchedule());
      }
    }).catch(err=>{
      dispatch(errorMakeConfig(err.response.statusText));
    })
  }
}

export const deleteInfo = (type,id) =>{
  return (dispatch,getState) =>{
    dispatch(startConfig())
    axios({
      method:'delete',
      url:`/schedule_config/${type}/${id}.json?auth=${getState().auth.token}`
    }).then(res => {
      if(type==='shifts'){
        dispatch(deleteAllocation());
      }else{
        dispatch(deleteSchedule());
      }
    }).catch(err=>{
      dispatch(errorMakeConfig(err.response.statusText));
    })
  };
};

export const editItems = (type,value) => {
  return (dispatch,getState) => {
    dispatch(startConfig())
    axios({
      method:'patch',
      url:`/schedule_config/.json?auth=${getState().auth.token}`,
      data:{[type]:value}
    }).then(res =>{
      if(type==='considerWeekends' || type==='nrDays' || type==='startDate'){
        dispatch(deleteAllocation());
      }else if(type==='shiftsPerWeek'){
        dispatch(deleteSchedule());
      }else{
        dispatch(getConfig('w/empl'));
      }
    }).catch(err=>{
      dispatch(errorMakeConfig(err.response.statusText));
    })
  };
};

const startAllocation = (dayName) => {
  return{
    type:actionTypes.START_ALLOCATION,
    name: dayName
  };
};

const endAllocation = () => {
  return{
    type:actionTypes.END_ALLOCATION
  };
};

const errorAllocation = (err,dayName) =>{
  return{
    type:actionTypes.ERROR_ALLOCATION,
    errMsg:err,
    name:dayName
  };
};

export const allocation = (dayName,shiftName,value) => {
  
  return (dispatch,getState) => {
    dispatch(startAllocation(dayName));
    axios({
      method:'patch',
      url:`/schedule_config/days/${dayName}/shifts/${shiftName}/.json?auth=${getState().auth.token}`,
      data:value
    }).then(res => {
      dispatch(getConfig('allocation'))
    }).catch(err =>{
      dispatch(errorAllocation(err.response.statusText,dayName))
    })
  };
};

  export const deleteAllocation = (alone) => {
  return (dispatch,getState) => {
    if(alone){
      dispatch(startConfig());
    }
    axios({
      method:'delete',
      url:`/schedule_config/days.json?auth=${getState().auth.token}`
    }).then(res=>{
      dispatch(deleteSchedule());
    }).catch(err=>dispatch(errorDeleteAllocation(err.response.statusText)))
  };
};

const errorDeleteAllocation = (err)=>{
  return{
    type:actionTypes.ERROR_DEL_ALLOC,
    errMsg:err
  };
};


export const addTemplate = (dayName,tempName,value) => {
  return (dispatch,getState) => {
    dispatch(startAllocation(dayName));
    axios({
      method:'patch',
      url:`/schedule_config/templates/${tempName}.json?auth=${getState().auth.token}`,
      data:value
    }).then(res =>{
      axios({
        method:'patch',
        url:`/schedule_config/days/${dayName}/.json?auth=${getState().auth.token}`,
        data:{useTemp:tempName}
      }).then(res =>{
        dispatch(getConfig('allocation'))
      }).catch(err => {
        dispatch(errorAllocation(err.response.statusText,dayName))
      })
    }).catch(err=>{
      dispatch(errorAllocation(err.response.statusText,dayName))
    })
  };
};

export const allocateShiftTemplate = (tempName,shiftName,value) =>{
  return (dispatch,getState) => {
    dispatch(startAllocation(tempName));
    axios({
      method:'patch',
      url:`/schedule_config/templates/${tempName}/${shiftName}/.json?auth=${getState().auth.token}`,
      data:value
    }).then(res => {
      dispatch(getConfig('allocation'));
    }).catch(err =>{
      dispatch(errorAllocation(err.response.statusText,tempName));
    })
  }
}

export const deleteTemplate = (tempName,payLoad) => {
  return (dispatch,getState) => {
    dispatch(startAllocation(tempName));
    axios({
      method:'delete',
      url:`/schedule_config/templates/${tempName}.json?auth=${getState().auth.token}`
    }).then(res => {
      axios({
        method:'patch',
        url:`/schedule_config/days.json?auth=${getState().auth.token}`,
        data:{...payLoad}
      }).then(res => {
        dispatch(getConfig('allocation'));
      }).catch(err =>{
        dispatch(errorAllocation(err.response.statusText,tempName));
      })
    }).catch(err =>{
      dispatch(errorAllocation(err.response.statusText,tempName));
    })
  };
};

export const useTemplate = (dayName,tempName) => {
  return (dispatch,getState) => {
    dispatch(startAllocation(dayName));
    axios({
      method:'patch',
      url:`/schedule_config/days/${dayName}.json?auth=${getState().auth.token}`,
      data:{useTemp:tempName}
    }).then(res => {
      dispatch(getConfig('allocation'));
    }).catch(err => {
      dispatch(errorAllocation(err.response.statusText,dayName));
    })
  }
}

const errorDelSchedule = (errMsg) => {
  return {
    type:actionTypes.ERROR_DEL_SCHEDULE,
    errMsg:errMsg
  };
};

const deleteSchedule = () => {
  return (dispatch,getState) => {
    axios({
      method:'delete',
      url:`/schedule.json?auth=${getState().auth.token}`
    }).then(res=>{
      dispatch(getConfig('w/empl'));
    }).catch(err =>{
      dispatch(errorDelSchedule(err.response.statusText));
    })
  };
};

export const resetConfigError = () => {
  return dispatch => {
    dispatch(resetConfig());
    dispatch(getConfig());
  };
};