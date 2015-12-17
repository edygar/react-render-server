const isProduction = process.env.NODE_ENV === "production";
module.exports = {
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 3000,
  apiHost: process.env.APIHOST || 'localhost',
  apiPort: process.env.APIPORT || 8080,

  isProduction: isProduction,
  isDevelopment: !isProduction,

  app: {
  }
};
