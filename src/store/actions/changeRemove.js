import * as actionTypes from './actionTypes';
import * as actions from './index';
import axios from '../../axios-instance';

 export const startChangeRemove = () => {
   return {
     type:actionTypes.START_CHANGE_REMOVE
   };
 };

 export const endChangeRemove = () => {
   return{
    type:actionTypes.END_CHANGE_REMOVE
   };
 };

 export const errorChangeRemove = (error) => {
  return{
    type:actionTypes.ERROR_CHANGE_REMOVE,
    errMsg:error
  };
 };

 const resetEmployee = () => {
   return{
    type:actionTypes.RESET_EMPLOYEE
   };
 };

 //Method used to for error reset in the case of the changeRemove reducer and for employees reducer it resets the employees prop.
 export const resetChangeRemove = (change) => {
   return dispatch => {
    dispatch(resetEmployee());
    if(change){
      dispatch(actions.resetEmpls());
    }
   };
 };;

 //Method that contains an async request(that uses the patch method(for change) to change employee info on the database) to the server using firebase rest api.
 //When changing the email, a request has to be made to change the user email on the server not only on the db.
 //If an admin wants to change another empls email, a cloud function must be used, changeEmail. 
 export const change = (identifier,name,value) => {
   return (dispatch,getState) => {
    
    dispatch(startChangeRemove());
    
    let dbChange = () => {
      axios({
        method:'patch',
        url:`/employees/${identifier}/.json?auth=${getState().auth.token}`,
        data:{[name]:value}
      }).then(res =>{
        dispatch(actions.getEmpls('changeRemove'));
      }).catch(err=>{
        dispatch(errorChangeRemove(err.response.statusText));
      })
    }
    let userId = getState().employees.employees[identifier].userId;

    if(name==='email' && userId.length > 10){
      let changeEmail = window.firebaseFunctions.httpsCallable('changeEmail');

      if(userId === localStorage.getItem('userId')){
        axios({
          method:'post',
          url:`https://identitytoolkit.googleapis.com/v1/accounts:update?key=key_from_firebase`,
          data:{
            idToken:getState().auth.token,
            email:value,
            returnSecureToken:true
          }
        }).then(res => {
          if(res.data.idToken){
            const expirationDate = new Date().getTime() + res.data.expiresIn * 1000;
            localStorage.setItem('token',res.data.idToken);
            localStorage.setItem('expirationDate',expirationDate);
    
            dispatch(actions.endAuth(res.data.idToken,res.data.localId,localStorage.getItem('admin')));
            clearTimeout(window.myTimerSchedule);
            dispatch(actions.checkAuthTimeout(res.data.expiresIn));
            dbChange();
          }
        }).catch(err => {
          dispatch(errorChangeRemove(err.message));
        })
      }else{
        changeEmail({email:value,userId:userId,token:localStorage.getItem('token')}).then(res => {
          if(!res.data.error){
            if(res.data.errorInfo){
              dispatch(errorChangeRemove(res.data.errorInfo.message));
            }else{
              dbChange();
            }
          }else{
            dispatch(errorChangeRemove(res.data.error));
          }
        }).catch(err => {
          dispatch(errorChangeRemove('Error related to firebase functions'));
        })
      }
    }else{
      dbChange();
    }
   };
 };

 //Method used to remove an empl from the db and also from the server. It can be used only by an admin user. The removal from the server is done via the delete user firebase function.
 export const remove = (identifier) => {
  return (dispatch,getState) => {
   dispatch(startChangeRemove());
   let userId = getState().employees.employees[identifier].userId;

   let deleteUser = window.firebaseFunctions.httpsCallable('deleteUser');

   let dbRemove = () => {
    axios({
      method:'delete',
      url:`/employees/${identifier}.json?auth=${getState().auth.token}`
    }).then(res =>{
      dispatch(actions.getEmpls('changeRemove'));
    }).catch(err=>{
      dispatch(errorChangeRemove(err.response.statusText));
    })
   }

   if(userId.length > 10){
    deleteUser({token:getState().auth.token,userId:userId}).then(res => {
      if(!res.data.error){
        if(res.data.errorInfo){
          dispatch(errorChangeRemove(res.data.errorInfo.message));
        }else{
          dbRemove();
        }
      }else{
        dispatch(errorChangeRemove(res.data.error));
      }
    })
   }else{
     dbRemove();
   }
   
  };
};

//Method that resets the error for changeRemove reducer and then gets employees and config info from the server
export const resetAccountError = () => {
  return dispatch => {
    dispatch(resetChangeRemove());
    dispatch(actions.resetConfig());
    dispatch(actions.getConfig('account'));
  };
};


