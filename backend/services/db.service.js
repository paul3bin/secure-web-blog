const auth = require("../utils/auth");
const pgp = require("pg-promise")();

const db = pgp(
  `postgres://${process.env.DSS_DB_USER}:${process.env.DSS_DB_PASSWORD}@${process.env.DSS_DB_HOST}/${process.env.DSS_DB_USER}`
);

async function callFunction(sql, params) {
  //console.log(db);
  const result = await db.query(
    'select * from "DSS"."usp_users_insert"($1, $2, $3, $4)',
    params
  );
  if (result != null && result.length > 0) {
    return result[0];
  } else {
    return 0;
  }
}

async function callQuery(sql) {
  //console.log(sql);
  const result = await db.query(sql);
  //console.log(result);
  return result;
}

async function callOneorNone(sql) {
  const result = await db.oneOrNone(sql);
  if (result != null) {
    return result;
  } else {
    return null;
  }
}

async function callAny(sql, values) {
  //console.log(sql);
  const result = await db.any(sql, values);
  return result;
}
module.exports = {
  callFunction,
  callQuery,
  callOneorNone,
  callAny,
};
