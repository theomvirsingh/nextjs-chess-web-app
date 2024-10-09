// redux/reducers/userReducer.js
import { SET_USER, SET_ERROR, SET_SUCCESS, CLEAR_MESSAGES } from '../actions/userActions';

const initialState = {
  user: null,
  error: '',
  success: '',
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload, error: '', success: '' };
    case SET_ERROR:
      return { ...state, error: action.payload, success: '' };
    case SET_SUCCESS:
      return { ...state, success: action.payload, error: '' };
    case CLEAR_MESSAGES:
      return { ...state, error: '', success: '' };
    default:
      return state;
  }
};

export default userReducer;
