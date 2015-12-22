module.exports = {
  self: {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 3000,
    prefix: process.env.PREFIX || ''
  },
  api: {
    host: process.env.APIHOST || 'localhost',
    port: process.env.APIPORT || 8080,
    prefix: process.env.APIPREFIX || '/api/v1'
  }
};
