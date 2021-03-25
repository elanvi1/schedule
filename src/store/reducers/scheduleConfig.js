import * as actionTypes from '../actions/actionTypes';

const initialState = {
  schedule_config: null,
  loading:false,
  loadAlloc:{},
  loadTemps:{},
  error: {
    getConfig:false,
    makeConfig:false,
    errorDelAlloc:false,
    delSchedule: false
  },
  errorAlloc:{}

}

const reducer = (state=initialState,action) =>{
  switch(action.type){
    case actionTypes.START_CONFIG:
      return{
        ...state,
        loading:true
      }
    case actionTypes.START_ALLOCATION:
      return{
        ...state,
        loadAlloc:{
          [action.name]:true
        }
      }
    case actionTypes.END_GET_CONFIG:
      return{
        ...state,
        schedule_config:action.config
      }
    case actionTypes.END_ALLOCATION:
      return{
        ...state,
        loadAlloc:{}
      }
    case actionTypes.END_CONFIG_LOAD:
      return{
        ...state,
        loading:false
      }
    case actionTypes.ERROR_GET_CONFIG:
      return{
        ...state,
        error:{
          ...state.error,
          getConfig:action.errMsg
        },
        loading:false
      }
    case actionTypes.ERROR_MAKE_CONFIG:
      return{
        ...state,
        error:{
          ...state.error,
          makeConfig:action.errMsg
        },
        loading:false
      }
    case actionTypes.ERROR_ALLOCATION:
      return{
        ...state,
        errorAlloc:{
          [action.name]:action.errMsg
        },
        loadAlloc:{}
      }
    case actionTypes.ERROR_DEL_ALLOC:
      return{
        ...state,
        error:{
          ...state.error,
          errorDelAlloc:action.errMsg
        },
        loading:false
      }
    case actionTypes.ERROR_DEL_SCHEDULE:
      return{
        ...state,
        error:{
          ...state.error,
          delSchedule:action.errMsg
        },
        loading:false
      }
    case actionTypes.RESET_CONFIG:
      return{
        ...state,
        error:{
          getConfig:false,
          makeConfig:false,
          errorDelAlloc:false,
          delSchedule:false
        },
        errorAlloc: {},
        schedule_config:null
      }
    default:
      return state
  }
};

export default reducer;