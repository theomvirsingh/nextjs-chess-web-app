// redux/store.js
import { createStore } from 'redux';
import rootReducer from './reducers';

const store = createStore(
  rootReducer,
  // Enable Redux DevTools Extension if available
  typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__
    ? window.__REDUX_DEVTOOLS_EXTENSION__()
    : (f) => f
);

export default store;
