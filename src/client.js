/* eslint-env browser, node */
import 'babel-polyfill';

import ReactDOM from 'react-dom';
import React from 'react';
import createStore from 'store/create';
import { isDevelopment } from 'config/env';
import Provider from 'react-redux';
import ReduxRouter from 'redux-router';

const info = require('debug')('info:client');
const initialState = global.__INITIAL_STATE__;
const store = createStore();
const mountNode = document.getElementById('content');

info('First client render starting…');
ReactDOM.render(
  <Provider store={store}>
    <Provider store={store}>
      <ReduxRouter/>
    </Provider>
  </Provider>,
  mountNode,
  ()=> info('First client render ended')
);


if (isDevelopment) {
  info('Mounting DevTools aside…');

  const DevTools = require('containers/DevTools');
  const devToolsHost = document.createElement("div");

  devToolsHost.setAttribute('id', 'devToolsRoot');
  document.body.appendChild(devToolsHost);

  ReactDOM.render(
    <Provider store={store}>
      <DevTools />
    </Provider>
  , devToolsHost);
  info('Just mounted DevTools aside');
}
