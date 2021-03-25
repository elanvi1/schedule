import * as actionTypes from '../actions/actionTypes';


const initialState ={
  loading:false,
  error: false
}

const reducer = (state=initialState,action) =>{
  switch(action.type){
    case actionTypes.START_CHANGE_REMOVE:
      return {
        ...state,
        loading:true
      }
    case actionTypes.END_CHANGE_REMOVE:
      return {
        ...state,
        loading:false
      }
    case actionTypes.ERROR_CHANGE_REMOVE:
      return {
        ...state,
        error: action.errMsg,
        loading:false
      }
    case actionTypes.RESET_EMPLOYEE:
      return{
        ...state,
        error:null,
        loading:false
      }
    default:
      return state;
  }
};

export default reducer; 