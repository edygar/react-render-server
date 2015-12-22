/* eslint-env browser, node */
import 'babel-polyfill';

import ReactDOM from 'react-dom';
import React from 'react';
import configureStore from 'config/store';
import getRoutes from 'config/routes';
import { isDevelopment } from 'config/env';

const initialState = global.__INITIAL_STATE__;
const store = configureStore(initialState);
const mountNode = document.getElementById('content');

ReactDOM.render(
  <Provider store={store}>
    <Router history={store.history}>
      { getRoutes(store) }
    </Router>
  </Provider>
, mountNode);


if (isDevelopment) {
  const DevTools = require('containers/DevTools');
  const devToolsHost = document.createElement("div");

  document.body.appendChild(devToolsHost);

  ReactDOM.render(
    <Provider store={store}>
      <DevTools />
    </Provider>
  , devToolsHost);
}
