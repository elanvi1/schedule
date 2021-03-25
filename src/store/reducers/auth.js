import * as actionTypes from '../actions/actionTypes';


const initialState ={
  loading:false,
  error: false,
  userId:'',
  token: '',
  admin:false
}

const reducer = (state=initialState,action) =>{
  switch(action.type){
    case actionTypes.START_AUTH:
      return {
        ...state,
        loading:true
      }
    case actionTypes.END_AUTH:
      return {
        ...state,
        token:action.token,
        userId:action.userId,
        admin:action.admin,
        loading:false,
      }
    case actionTypes.END_LOAD_AUTH:
      return {
        ...state,
        loading:false
      }
    case actionTypes.ERROR_AUTH:
      return {
        ...state,
        error: action.errMsg,
        loading:false
      }
    case actionTypes.AUTH_LOGOUT:
      return{
        ...state,
        token:'',
        userId: '',
        admin:false
      }
    case actionTypes.RESET_AUTH:
      return{
        ...state,
        error:null
      }
    default:
      return state;
  }
};

export default reducer; 