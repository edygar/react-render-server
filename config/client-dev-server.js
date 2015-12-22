var Express = require('express');
var webpack = require('webpack');

var servers = require('../src/config/servers');
var webpackConfig = require('./webpack.config.dev');

var host = servers.self.host || 'localhost';
var port = (servers.self.port + 1) || 3001;
var prefix = servers.self.prefix || '';

var serverOptions = {
  contentBase: 'http://' + host + ':' + port + prefix,
  quiet: true,
  noInfo: true,
  hot: true,
  inline: true,
  lazy: false,
  publicPath: webpackConfig.output.publicPath,
  headers: {'Access-Control-Allow-Origin': '*'},
  stats: {colors: true}
};

var app = new Express();
var compiler = webpack(webpackConfig);

app.use(require('webpack-dev-middleware')(compiler, serverOptions));
app.use(require('webpack-hot-middleware')(compiler));

app.listen(port, function onAppListening(err) {
  if (err) {
    console.error(err);
  } else {
    console.info('==> 🚧  Webpack development server listening on port %s', port);
  }
});
