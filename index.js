const info = require('debug')('info:bootstrap');

global.__SERVER__ = true;
global.__CLIENT__ = false;

info('Enabling ES6 runtime transpiler');
require('babel-core/register');

const WebpackIsomorphicTools = require('webpack-isomorphic-tools');
const isomorphicConfig = require('./config/isomorphic.config');
const env = require('./src/config/env');

if (env.isDevelopment) {
  if (!require('piping')({
      hook: true,
      ignore: /(\/\.|~$|\.json)/i
    })) {
    return;
  }
}

info('Bundling Webpack server-side…');
// Globalizing isomorphic tools
global.webpackIsomorphicTools = new WebpackIsomorphicTools(isomorphicConfig)
.development(env.isDevelopment)
.server(__dirname, function() {
  info('Bundled Webpack server-side');
  require('./src/server');
});



