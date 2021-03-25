import * as actionTypes from '../actions/actionTypes';

const initialState = {
  error: false,
  errorSend: false,
  loading:false,
  schedule:null
}

const reducer = (state=initialState,action) => {
  switch(action.type){
    case actionTypes.START_GET_SCHEDULE:
      return {
        ...state,
        loading:true
      }
    case actionTypes.END_GET_SCHEDULE:
      return{
        ...state,
        schedule:action.schedule
      }
    case actionTypes.END_SCHEDULE_LOAD:
      return{
        ...state,
        loading:false
      }
    case actionTypes.ERROR_GET_SCHEDULE:
      return{
        ...state,
        loading:false,
        error:action.errMsg
      }
    case actionTypes.ERROR_SEND_SCHEDULE:
      return{
        ...state,
        loading:false,
        errorSend:action.errMsg
      }
    case actionTypes.RESET_SCHEDULE:
      return{
        ...state,
        error:false,
        errorSend:false,
        schedule:null
      }
    default:
      return state
  }
}

export default reducer;