import * as actionTypes from './actionTypes';
import * as actions from './index';
import axios from '../../axios-instance';

 export const startGetEmpls = () => {
   return {
     type:actionTypes.START_GET_EMPLS
   };
 };

 const endGetEmpls = (employees) => {
   return{
    type:actionTypes.END_GET_EMPLS,
    employees:employees
   };
 };

 export const errorGetEmpls = (error) => {
  return{
    type:actionTypes.ERROR_GET_EMPLS,
    error:error
  };
 };

 export const resetEmpls = () => {
   return {
    type:actionTypes.RESET_EMPLS
   };
 };

 //Method used to make an async request to the server using the get method in order to get the employees info. The are multiple components that want this information therefor other methods are dispatched in order to set loading to false for other reducers once the process is done.
 export const getEmpls = (recipient) => {
   return (dispatch,getState) => {
   
    axios({
      method:'get',
      url:`/employees.json?auth=${getState().auth.token}`
    }).then(res =>{
      for (let empl in res.data){
        res.data[empl].identifier = empl
      }
      dispatch(endGetEmpls(res.data));
      if(recipient==='changeRemove' ||recipient ==='account') {
        dispatch(actions.endChangeRemove());
      }else if(recipient==='scheduleConfig'){
        dispatch(actions.endConfigLoading())
      }else if(recipient==='schedule'){
        dispatch(actions.endScheduleLoad());
      }
    }).catch(err=>{
      if(typeof recipient === 'undefined'){
        dispatch(errorGetEmpls(err.response.statusText));
      }
      if(recipient ==='changeRemove' ||recipient ==='account'){
        dispatch(actions.errorChangeRemove(err.response.statusText));
      }else if(recipient ==='scheduleConfig'){
        dispatch(actions.errorGetConfig(err.response.statusText));
      }else if(recipient==='schedule'){
        dispatch(actions.errorGetSchedule(err.response.statusText));
      }
    })
   };
 };

//Method that resets the error prop from changeRemove reducer and the schedule_config and employees props. Then it gets the config and employees info from the server.
export const resetEmplsError = () => {
  return dispatch => {
    dispatch(actions.resetChangeRemove());
    dispatch(actions.resetConfig());
    dispatch(actions.getConfig('employees'));
  };
};

