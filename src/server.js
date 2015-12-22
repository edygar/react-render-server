/* global webpackIsomorphicTools */
import path from 'path';
import morgan from 'morgan';
import Express from 'express';
import httpProxy from 'http-proxy';
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
import createStore from './config/createStore';

const pretty = new PrettyError();
const app = new Express();
const debug = require('debug')('server');
const error = require('debug')('server:error');

debug('Setting up server');
app.set('port', servers.self.port);
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(compression());

debug('Setting up static assets on /public');
app.use('/public', Express.static(path.join(__dirname, '..', 'public')));

debug('Setting up proxy to API server');
const proxy = httpProxy.createProxyServer({
  target: `http://${servers.api.host}:${servers.api.port}`
});

debug('Exposing API server on /api');
app.use('/api', (req, res) => {
  proxy.web(req, res);
});

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


function render(store) {
  return '<!doctype html>\n' +
    ReactDOM.renderToStaticMarkup(
      <Html
        assets={webpackIsomorphicTools.assets()}
        store={store}>
        <RouterContext />
      </Html>
    );
}

debug('Setting up renderer callback');
app.use((req, res) => {
  if (isDevelopment) {
    debug('Refreshing assets');
    // Do not cache webpack stats: the script file would change since
    // hot module replacement is enabled in the development env
    webpackIsomorphicTools.refresh();
  }

  const store = createStore();
  store.dispatch(req.originalUrl, (err, redirectLocation, routerState)=> {
    if (redirectLocation) {
      res.redirect(redirectLocation.pathname + redirectLocation.search);
      return;
    }

    if (err) {
      error('Router error: ', pretty.render(err));
      res.status(500);
      res.send(render(store));
      return;
    }

    if (!routerState) {
      res.status(500);
      res.send(render(store));
      return;
    }

    const status =
      routerState.routes.reduce((prev, cur) => cur.status || prev, null);

    store.getState().router.then(() => {
      if (status) res.status(status);
      res.send(render(store));
    })
    .catch(err => {
      error('Data Fetching Error: ', pretty.render(err));
      res.status(500);
      res.send(render(store));
    });
  });
});

app.listen(servers.self.port, servers.self.host,  function() {
  debug('Serving on http://%s:%s', servers.self.host, servers.self.port);
});

