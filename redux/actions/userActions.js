// redux/actions/userActions.js

export const SET_USER = 'SET_USER';
export const SET_ERROR = 'SET_ERROR';
export const SET_SUCCESS = 'SET_SUCCESS';
export const CLEAR_MESSAGES = 'CLEAR_MESSAGES';

export const setUser = (user) => ({
  type: SET_USER,
  payload: user,
});

export const setError = (error) => ({
  type: SET_ERROR,
  payload: error,
});

export const setSuccess = (message) => ({
  type: SET_SUCCESS,
  payload: message,
});

export const clearMessages = () => ({
  type: CLEAR_MESSAGES,
});
