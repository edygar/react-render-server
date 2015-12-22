/* eslint-env browser, node */
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { syncReduxAndRouter, routeReducer } from 'redux-simple-router';
import thunk from 'redux-thunk';
import api from './middlewares';
import DevTools from '../containers/DevTools';
import {createBrowserHistory, createMemoryHistory} from 'history/lib/createBrowserHistory';
import {isDevelopment, isClient} from 'config/env';

import reducers from 'store/reducers';

let middlewares = [
  // Allows actions transformation into fetch
  applyMiddleware( thunk, api)
];

if (isDevelopment && isClient) {
  // Client Development configurations
  middlewares = reducers.concat([
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
const finalReducers = combineReducers({...reducers, routing: routeReducer });

export default function configureStore(initialState = {}) {
  const store = finalCreateStore(finalReducers, initialState);
  store.history = isClient ? createBrowserHistory() : createMemoryHistory();

  // keeps router and store in sync
  syncReduxAndRouter(store.history, store);

  if (isDevelopment && module.hot) {
    // replaces the current reducers when new are available
    module.hot.accept('../reducers', () => {
      store.replaceReducer(require('../reducers'));
    });
  }

  return store;
}
