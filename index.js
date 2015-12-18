const debug = require('debug')('server:bootstrap');

debug('Enabling ES6 runtime transpiler');
require('babel-core/register');

const WebpackIsomorphicTools = require('webpack-isomorphic-tools');
const isomorphicConfig = require('./config/isomorphic.config');
const appConfig = require('./src/config');

if (appConfig.isDevelopment) {
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
.development(appConfig.isDevelopment)
.server(__dirname, function() {
  debug('Bundled Webpack server-side');
  require("./src/server");
});



