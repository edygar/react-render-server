/* eslint-env browser, node */
import 'babel-polyfill';

import ReactDOM from 'react-dom';
import React from 'react';
import createStore from 'store/create';
import useStandardScroll from 'scroll-behavior/lib/useStandardScroll';
import { isDevelopment } from 'config/env';
import { Provider } from 'react-redux';
import { ReduxRouter } from 'redux-router';
import { reduxReactRouter } from 'redux-router';
import { createHistory } from 'history';
import getRoutes from 'config/routes';

const info = require('debug')('info:client');
const initialState = global.__INITIAL_STATE__;
const mountNode = document.getElementById('content');

const store = createStore(
  reduxReactRouter,
  getRoutes,
  useStandardScroll(createHistory),
  global.__INITIAL_STATE__
);

info('First client render starting…');
ReactDOM.render(
  <Provider store={store} key="provider">
    <ReduxRouter/>
  </Provider>
  , mountNode,
  ()=> info('First client render ended')
);


if (isDevelopment) {
  info('Mounting DevTools aside…');

  const DevTools = require('containers/DevTools').default;
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
