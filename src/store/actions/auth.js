import * as actionTypes from './actionTypes';
import axios from '../../axios-instance';
import * as actions from './index';

const startAuth = () => {
  return {
    type:actionTypes.START_AUTH
  };
};

//Method used to add info about authentication to the redux store
export const endAuth = (token,userId,admin) => {
  return {
    type:actionTypes.END_AUTH,
    token:token,
    userId:userId,
    admin:admin
  };
};

const endLoadAuth = () => {
  return{
    type:actionTypes.END_LOAD_AUTH
  };
};

const errorAuth = (message) => {
  return {
    type:actionTypes.ERROR_AUTH,
    errMsg: message
  };
};

export const resetAuth = () => {
  return {
    type: actionTypes.RESET_AUTH,
  }
}

// Method used to add an employee, not register him. It used only by admin users for testing purposes
export const addEmplOnly = (employee) => {
  return (dispatch,getState) => {
    dispatch(startAuth());
    axios({
      method:'post',
      url:`/employees.json?auth=${getState().auth.token}`,
      data: employee
    }).then(res=>{
      dispatch(endLoadAuth());
    }).catch(err=>{
      dispatch(errorAuth(err.response.statusText));
    })
  };
};

//Method that adds the employee info to the server
export const addEmplRegister = (employee,token,admin) => {
  return dispatch => {
    axios({
      method:'post',
      url:`/employees.json?auth=${token}`,
      data: employee
    }).then(res=>{
      dispatch(endAuth(token,employee.userId,admin));
    }).catch(err=>{
      dispatch(errorAuth(err.response.statusText));
    })
  };
};

//Method used to authenticate the user on the server. It is done by making an async request using the Firebase Rest Api for authentication
//createAdminUser firebase function is used to create a user and add admin:true custom claim.
//Authentication info is saved in local storage in case the user reloads or closes the tab. It is later used so that the user doesn't have to log in again(assuming the expiration time hasn't passed)
export const auth = (employee,logIn) => {
  return dispatch => {
    dispatch(startAuth());

    let email = employee.email.split('@')[1].trim().split('.')[0].trim();
    let admin = false;

    if(email ==='admin')admin=true;

    let createAdminUser = window.firebaseFunctions.httpsCallable('createAdminUser');

    // window.auth.signInWithEmailAndPassword(employee.email,employee.password).then(cred => {
    //   cred.user.getIdTokenResult().then(idTokenresult =>{
    //     localStorage.setItem('token',idTokenresult.token);
    //     localStorage.setItem('userId', idTokenresult.claims.user_id);
    //     localStorage.setItem('admin', idTokenresult.claims.admin)

    //     dispatch(endAuth(idTokenresult.token,idTokenresult.claims.user_id,idTokenresult.claims.admin))
    //   })
    // })

    // window.auth.currentUser.getIdTokenResult().then(res => {
    //   console.log(res)
    // })

    const authActual = (logIn,regAdmin) => {
      let urlAuth = logIn ? 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=key_from_firebase' : 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=key_from_firebase'

      axios({
        method:'post',
        url:urlAuth,
        data:{
          email:employee.email,
          password:employee.password,
          returnSecureToken: true
        }
      }).then(res => {
        delete employee.password;
        
        const expirationDate = new Date().getTime() + res.data.expiresIn * 1000;
        localStorage.setItem('token',res.data.idToken);
        localStorage.setItem('expirationDate',expirationDate);
        localStorage.setItem('userId', res.data.localId);
        localStorage.setItem('admin', admin)

        clearTimeout(window.myTimerSchedule);
        dispatch(checkAuthTimeout(res.data.expiresIn));

        employee.userId = res.data.localId;

        if(logIn){
          if(regAdmin){
            dispatch(addEmplRegister(employee,res.data.idToken,admin));
          }else{
            dispatch(endAuth(res.data.idToken,res.data.localId,admin));
          }
        }else{
          dispatch(addEmplRegister(employee,res.data.idToken,admin));
        }
      }).catch(err => {
        dispatch(errorAuth(err.response.statusText))
      })
    }

    if(logIn){
      authActual(logIn);
    }else{
      if(email==='admin'){
        createAdminUser({email:employee.email,password:employee.password}).then(res => {
          if(!res.data.error){
            dispatch(authActual(true,true))
          }else{
            dispatch(errorAuth(res.data.error))
          }
        })
      }else{
        authActual(logIn);
      }
    }
  };
};

//When logging out the information regarding auth is removed from local storage and redux store
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('expirationDate');
  localStorage.removeItem('userId');
  localStorage.removeItem('admin');
  return {
    type: actionTypes.AUTH_LOGOUT
  };
};

//The auth token has a expirationTime, this method automatically logs out the user after that time has passed.
export const checkAuthTimeout = (expirationTime) => {
  return dispatch => {
    window.myTimerSchedule = setTimeout(()=> {
      dispatch(logout());
    },parseInt(expirationTime) * 1000);
  };
};

//This method is triggered when the App comp mounts. It checks the auth info in local storage, more specifically the expiration time to see if the token expired. If it hasn't it passes the auth info to the redux store, and if it has it removes the auth info from local storage.
export const authCheckState = () => {
  return dispatch => {
    const token = localStorage.getItem('token');
    const admin = localStorage.getItem('admin');

    if(token){
      const expirationDate = localStorage.getItem('expirationDate');

      if(expirationDate > new Date().getTime()){
        const userId = localStorage.getItem('userId');
        dispatch(endAuth(token,userId,admin));
        clearTimeout(window.myTimerSchedule);
        dispatch(checkAuthTimeout((expirationDate - new Date().getTime())/1000));
      }else{
        dispatch(logout());
      }
    }
  };
};

//Method used to change the password by using firebase Rest Api for authentification.
export const changePassword = (password) => {
  return (dispatch,getState) => {
    dispatch(actions.startChangeRemove());
    axios({
      method:'post',
      url:`https://identitytoolkit.googleapis.com/v1/accounts:update?key=key_from_firebase`,
      data :{
        idToken: getState().auth.token,
        password: password,
        returnSecureToken:true
      }
    }).then(res => {
        const expirationDate = new Date().getTime() + res.data.expiresIn * 1000;
        localStorage.setItem('token',res.data.idToken);
        localStorage.setItem('expirationDate',expirationDate);
        
        clearTimeout(window.myTimerSchedule);
        dispatch(endAuth(res.data.idToken,res.data.localId,localStorage.getItem('admin')));
        dispatch(checkAuthTimeout(res.data.expiresIn));
        dispatch(actions.endChangeRemove());
    }).catch(err=>{
        dispatch(actions.errorChangeRemove(err.response.statusText))
    })
  };
};
