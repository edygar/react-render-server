
export const isProduction = process.env.NODE_ENV === "production";
export const isDevelopment =!isProduction;
export const isSever = global.__SERVER__;
export const isClient = global.__CLIENT__;

