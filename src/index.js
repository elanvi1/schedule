import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import {combineReducers, createStore,applyMiddleware,compose} from 'redux';
import {Provider} from 'react-redux';
import Thunk from 'redux-thunk';

import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import authReducer from './store/reducers/auth';
import employeesReducer from './store/reducers/employees';
import changeRemoveReducer from './store/reducers/changeRemove';
import scheduleConfig from './store/reducers/scheduleConfig';
import schedule from './store/reducers/schedule';

//Combine multiple reducers for Redux into a main one which will the be passed to the store
const mainReducer = combineReducers({
  auth: authReducer,
  employees: employeesReducer,
  changeRemove: changeRemoveReducer,
  config: scheduleConfig,
  schedule: schedule
})

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

//Create the redux store with the main reducer and apply Thunk middleware for async actions
const store = createStore(mainReducer,composeEnhancers(applyMiddleware(Thunk)));

// Wrap the main app component in the BrowserRouter for routing and Provider for Redux
ReactDOM.render(
    <BrowserRouter basename="/schedule/">
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  ,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
