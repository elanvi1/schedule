import * as actionTypes from '../actions/actionTypes'

const initialState = {
  employees: null,
  loading: false,
  error: false
}

const reducer = (state=initialState,action) => {
  switch(action.type){
    case actionTypes.START_GET_EMPLS:
      return{
        ...state,
        loading:true
      }
    case actionTypes.END_GET_EMPLS:
      return{
        ...state,
        loading:false,
        employees:action.employees
      }
    case actionTypes.ERROR_GET_EMPLS:
      return{
        ...state,
        loading:false,
        error:action.error
      }
    case actionTypes.RESET_EMPLS:
      return{
        ...state,
        employees:null,
        error:false
      }
    default:
      return state
  }
}

export default reducer;