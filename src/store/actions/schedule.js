import * as actionTypes from './actionTypes';
import * as actions from './index';
import axios from '../../axios-instance';
const axiosMain = require('axios').default;

const startGetSchedule = () => {
  return{
    type:actionTypes.START_GET_SCHEDULE
  };
};

const endGetSchedule = (schedule) => {
  return {
    type:actionTypes.END_GET_SCHEDULE,
    schedule:schedule
  };
};

export const endScheduleLoad = () => {
  return {
    type:actionTypes.END_SCHEDULE_LOAD
  };
};

export const errorGetSchedule = (errMsg) => {
  return {
    type:actionTypes.ERROR_GET_SCHEDULE,
    errMsg:errMsg
  };
};

const resetScheduleStandard = () => {
  return {
    type:actionTypes.RESET_SCHEDULE
  };
};

export const resetSchedule = () => {
  return dispatch => {
    dispatch(resetScheduleStandard());
    dispatch(actions.resetConfig());
  }
}

//Method used to retrieve the schedule,employees and config info from the server via an asyn request using the get method.
export const getSchedule = (simple) => {
  return (dispatch,getState) =>{
    if(typeof simple === 'undefined'){
      dispatch(startGetSchedule());
    }
    
    axios({
      method:'get',
      url:`/schedule.json?auth=${getState().auth.token}`
    }).then(res => {
      dispatch(endGetSchedule(res.data));
      if(typeof simple === 'undefined'){
        dispatch(actions.getConfig('schedule'))
      }else{
        dispatch(endScheduleLoad());
      }
      
    }).catch(err => {
      // console.log(err.response.statusText)
      dispatch(errorGetSchedule(err.response.statusText));
    })
  };
};

//Method used to send the schedule info to the server by making async request using put method. This is triggered when the user creates the schedule.
//Individual info regarding each employee's schedule is also sent to the server.
export const sendSchedule = (schedule, individualSchedule) => {
  return (dispatch,getState) => {
    dispatch(startGetSchedule());
    axios({
      method:'put',
      url:`/schedule.json?auth=${getState().auth.token}`,
      data: schedule
    }).then(res => {
      let requestArray = [];
      for(let empl in individualSchedule){
        requestArray.push(() => {
          axios({
            method:'patch',
            url:`/employees/${empl}/.json?auth=${getState().auth.token}`,
            data:{schedule:individualSchedule[empl]}
          }).then(res=>res).catch(err=>dispatch(errorSendSchedule(err.response.statusText)));
        });
      };

      axiosMain.all(requestArray.map(el => el())).then(res => {
        dispatch(getSchedule(true));
      })

    }).catch(err => {
      dispatch(errorGetSchedule(err.response.statusText));
    })
  };
};

const errorSendSchedule = (errMsg) => {
  return{
    type:actionTypes.ERROR_SEND_SCHEDULE,
    errMsg:errMsg
  };
};

export const deleteSchedule = () => {
  return (dispatch,getState) => {
    dispatch(startGetSchedule());
    axios({
      method:'delete',
      url:`/schedule.json?auth=${getState().auth.token}`
    }).then(res=>{
      dispatch(getSchedule(true));
    }).catch(err=>{
      dispatch(errorGetSchedule(err.response.statusText));
    })
  };
};

//Method used to reset the error and schedule from the schedule reducer along with schedule_config and employees. Then request is made to get schedule,config and employees info from the server. 
export const resetScheduleError = () => {
  return dispatch => {
    dispatch(resetSchedule());
    dispatch(getSchedule());
  };
};