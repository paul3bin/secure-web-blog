const env = process.env;
const fs = require("fs");
const db = {
  host: env.DSS_DB_HOST,
  user: env.DSS_DB_USER,
  password: env.DSS_DB_PASSWORD,
  database: env.DSS_DB_NAME,
  port: env.DSS_DB_PORT,
};

module.exports = db;
