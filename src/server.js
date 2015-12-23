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
import createStore from './store/create';
import { pushPath } from 'redux-simple-router';
import { match } from 'react-router';
import getRoutes from 'config/routes';

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


debug('Setting up renderer callback');
app.use((req, res) => {
  if (isDevelopment) {
    // Do not cache webpack stats: the script file would change since
    // hot module replacement is enabled in the development env
    webpackIsomorphicTools.refresh();
  }

  const store = createStore();

  store.dispatch(match(req.originalUrl, (err, redirectLocation, routerState) => {
    if (redirectLocation) {
      res.redirect(redirectLocation.pathname + redirectLocation.search);
    } else if (err) {
      error('ROUTER ERROR:', pretty.render(err));
      res.status(500);
    } else if (!routerState) {
      res.status(500);
    } else {
      // Workaround redux-router query string issue:
      // https://github.com/rackt/redux-router/issues/106
      if (routerState.location.search && !routerState.location.query) {
        routerState.location.query = qs.parse(routerState.location.search);
      }

      store.getState().router.then(() => {
        const component = (
          <Provider store={store} key="provider">
            <ReduxRouter/>
          </Provider>
        );

        const status = getStatusFromRoutes(routerState.routes);
        if (status) {
          res.status(status);
        }
        res.send('<!doctype html>\n' +
          ReactDOM.renderToString(<Html assets={webpackIsomorphicTools.assets()} component={component} store={store}/>));
      }).catch((err) => {
        console.error('DATA FETCHING ERROR:', pretty.render(err));
        res.status(500);
        hydrateOnClient();
      });
    }
  }));
});

app.listen(servers.self.port, servers.self.host,  function() {
  debug('Serving on http://%s:%s', servers.self.host, servers.self.port);
});

