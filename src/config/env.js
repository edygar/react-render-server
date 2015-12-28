/* global __SERVER__, __CLIENT__ */
export const isProduction = process.env.NODE_ENV === "production";
export const isDevelopment =!isProduction;
export const isServer = __SERVER__;
export const isClient = __CLIENT__;
