import React from 'react';
import ReactDOM from 'react-dom/server';
import AppWrapper from  './components/AppWrapper';
import App from  './containers/App';

import path from 'path';
import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import serialize from 'serialize-javascript';

import config from './config';
const { isDevelopment, isProduction } = config;

const server = express();
const debug = require('debug')('server');

debug('Setting up server');
server.set('port', config.port);
server.use(morgan(isProduction ? 'combined' : 'dev'));
server.use(bodyParser.json());
server.use(bodyParser.text());
server.use(bodyParser.raw());
server.use(bodyParser.urlencoded({ 'extended': true }));
server.use(cookieParser());
server.use(compression());

debug('Setting up static assets on /public')
server.use('/public', express.static(path.join(__dirname, '..', 'public')));

debug('Setting up GET renderer');
server.get('*', (req, res) => {
  if (isDevelopment) {
    debug('Refreshing assets');
    // Do not cache webpack stats: the script file would change since
    // hot module replacement is enabled in the development env
    webpackIsomorphicTools.refresh();
  }

  res.send(
   '<!doctype html>\n' +
   ReactDOM.renderToStaticMarkup(
     <AppWrapper
       assets={webpackIsomorphicTools.assets()}
       store={{}}
       component={<App/>}
     />
   ));
});

server.listen(config.port, config.host,  function() {
  debug('==> 💻  Open http://%s:%s in a browser to view the app.', config.host, config.port);
});

