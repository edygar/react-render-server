module.exports = {
  self: {
    protocol: process.env.PROTOCOL || 'http',
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 3000,
    prefix: process.env.PREFIX || ''
  },
  api: {
    protocol: process.env.APIPROTOCOL || 'https',
    host: process.env.APIHOST || 'api.github.com',
    port: process.env.APIPORT || 443,
    prefix: process.env.APIPREFIX || '',
    proxyThrought: process.env.PROXYAPITHROUGHT || false
  }
};
