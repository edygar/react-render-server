const debug = require('debug')('bootstrap');

global.__SERVER__ = true;
global.__CLIENT__ = false;

debug('Enabling ES6 runtime transpiler');
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

debug('Bundling Webpack server-side…');
// Globalizing isomorphic tools
global.webpackIsomorphicTools = new WebpackIsomorphicTools(isomorphicConfig)
.development(env.isDevelopment)
.server(__dirname, function() {
  debug('Bundled Webpack server-side');
  require('./src/server');
});



