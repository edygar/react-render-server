/* global webpackIsomorphicTools */
import path from 'path';
import morgan from 'morgan';
import Express from 'express';
import httpProxy from 'http-proxy';
import favicon from 'serve-favicon';
import compression from 'compression';
import PrettyError from 'pretty-error';
import serialize from 'serialize-javascript';

import servers from './config/servers';
import {
  isDevelopment,
  isProduction
} from './config/env';

import React from 'react';
import ReactDOM from 'react-dom/server';
import Html from './components/Html';
import App from './containers/App';
import createStore from './store/create';
import getStatusFromRoutes from 'utils/getStatusFromRoutes';
import {ReduxRouter} from 'redux-router';
import {createMemoryHistory} from 'history';
import {reduxReactRouter, match} from 'redux-router/server';
import {Provider} from 'react-redux';
import getRoutes from 'config/routes';


const pretty = new PrettyError();
const app = new Express();

const info = require('debug')('info:server');
const error = require('debug')('error:server');

info('Setting up server');
app.set('port', servers.self.port);
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(compression());
app.use(favicon(path.join(__dirname, '..', 'public', 'favicon.ico')));

info('Setting up static assets on /public');
app.use('/public', Express.static(path.join(__dirname, '..', 'public')));

if (servers.api.proxyThrought) {
  info('Setting up proxy to API server');
  const proxy = httpProxy.createProxyServer({
    target: `${servers.api.protocol}://${servers.api.host}:${servers.api.port}`
  });

  info('Exposing API server on /api');
  app.use(server.api.proxyThrought, (req, res) => proxy.web(req, res));

  proxy.on('error', (err, req, res) => {
    let json;
    if (err.code !== 'ECONNRESET') {
      error('proxy error', pretty.render(err));
    }
    if (!res.headersSent) {
      res.writeHead(500, {'content-type': 'application/json'});
    }

    json = {error: 'proxy_error', reason: err.message};
    res.end(JSON.stringify(json));
  });
}

const render = (store, clientOnly = false) =>
  '<!doctype html>\n' + ReactDOM.renderToString(
    <Html assets={webpackIsomorphicTools.assets()} store={store}>
      {clientOnly? null:
        <Provider store={store}>
          <ReduxRouter />
        </Provider>
      }
    </Html>
  );

info('Setting up renderer callback');
app.use((req, res) => {
  if (isDevelopment) {
    // Do not cache webpack stats: the script file would change since
    // hot module replacement is enabled in the development env
    webpackIsomorphicTools.refresh();
  }

  const store = createStore(reduxReactRouter, getRoutes, createMemoryHistory, {});

  store.dispatch(match(req.originalUrl, (err, redirectLocation, routerState) => {
    if (!redirectLocation && !err && routerState) {
      store.getState().router.then(() => {
        const status = getStatusFromRoutes(routerState.routes);
        if (status) res.status(status);

        res.send(render(store));
      }) .catch((err) => {
        error('Data fetching error:', pretty.render(err));
        res.send(render(store, true));
      });
    } else if (redirectLocation) {
      res.redirect(redirectLocation.pathname + redirectLocation.search);
    } else {
      if (err) error('Router Error:', pretty.render(err));

      res.status(500);
      res.send(render(store, true));
    }
  }));
});

app.listen(servers.self.port, servers.self.host,  function() {
  info('Serving on http://%s:%s', servers.self.host, servers.self.port);
});

