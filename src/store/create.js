/* eslint-env browser, node */
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import {isDevelopment, isClient} from 'config/env';
import {createBrowserHistory, createMemoryHistory} from 'history';
import useStandardScroll from 'scroll-behavior/lib/useStandardScroll';
import {reduxReactRouter} from 'redux-router';
import DevTools from 'containers/DevTools';
import thunk from 'redux-thunk';
import reducers from './reducers';
import fetchData from './middlewares/fetchData';
import api from './middlewares/api';
import getRoutes from 'config/routes';

let reduxSettings = [
  // Allows actions transformation into fetch
  applyMiddleware( thunk, api, fetchData)
];

if (isDevelopment && isClient) {
  // Client Development configurations
  reduxSettings = reducers.concat([
    // Logs all actions fired
    applyMiddleware(require('redux-logger')()),

    // Configure Redux DevTools Panel
    require('../containers/DevTools').instrument(),

    // Persists state through url and session storage
    require('redux-devtools').persistState(
      window.location.href.match(/[?&]debug_session=([^&]+)\b/)
    )
  ]);
}

const finalCreateStore = compose(...reduxSettings)(createStore);

export default function configureStore(initialState = {}) {
  let createHistory;
  if (isClient) {
    createHistory = useStandardScroll(createBrowserHistory);
  } else {
    createHistory = createMemoryHistory;
  }

  const store = reduxReactRouter({ getRoutes, createHistory })(finalCreateStore)(reducers, initialState);


  if (isDevelopment && module.hot) {
    // replaces the current reducers when new are available
    module.hot.accept('../reducers', () => {
      store.replaceReducer(require('../reducers'));
    });
  }

  return store;
}
