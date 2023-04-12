const db = require("./db.service");
const auth = require("../utils/auth");
const { PreparedStatement: PS } = require("pg-promise");
const jwt = require("jsonwebtoken");
const email = require("./email.service");
const redis = require("redis");
const redisClient = redis.createClient();

async function getById(id) {
  const findUserById = new PS({
    name: "find-user-by-id",
    text: 'select email, name, phone_number from "DSS".tbl_users_data where user_id = $1',
    values: [id],
  });

  const result = await db.callQuery(findUserById);

  if (result != null && result.length > 0) {
    result[0].email = await auth.decryptData(result[0].email);
    result[0].name = await auth.decryptData(result[0].name);
    result[0].phone_number = await auth.decryptData(result[0].phone_number);
    return result;
  } else {
    return null;
  }
  return result;
}

async function getAll() {
  /* const result = await db.callQuery(
    'select * from "DSS"."tbl_users_data"',
    null
  );
  if (result.length > 0) {
    result[0].name = await auth.decryptData(result[0].name);
    result[0].phone_number = await auth.decryptData(result[0].phone_number);
    return result;
  } else {
    return null;
  }
  return result;*/
}

async function authenticate(userParams, ipaddress, userAgent) {
  //console.log("userparams", userParams.email);
  userParams["ipAddress"] = ipaddress;
  userParams["userAgent"] = userAgent;
  const findUser = new PS({
    name: "authenticate-user",
    text: 'select * from "DSS".tbl_users_data where email = $1',
    values: [userParams.email],
  });
  const user = await db.callOneorNone(findUser);
  return await validatePassword(user, userParams);
}

async function validatePassword(user, userParams) {
  //IF VALID EMAIL ADDRESS
  if (user) {
    if (user.lock_account) {
      //  console.log("inside user account locked");
      return { status: "fail", message: "User Account Locked" };
    }
    // console.log("inside user", user);
    const validPassword = await auth.comparePassword(
      userParams.password,
      user.password_hash
    );
    if (validPassword) {
      const token = jwt.sign(
        {
          _id: user._id,
          /*ipaddress: userParams.ipaddress,
          userAgent: userParams.userAgent,*/
          email: user.email,
        },
        process.env.DSS_SECRET_KEY,
        { expiresIn: "2d" }
      );
      const otp = await generateOTP(user);
      await redisClient.connect();
      await redisClient.set(token, otp, 600);
      await redisClient.disconnect();
      return { status: "pass", token, otp };
    }
    //PASSWORD IS NOT VALID
    else {
      //Update the invalid login attempts flag in the database and lock the account if the attemtps exceeded 5.
      const updateUserLoginAttempts = new PS({
        name: "update-user-login-attempts",
        text: 'Update "DSS".tbl_users_data set login_attempt_count = login_attempt_count + 1, lock_account =  CASE WHEN login_attempt_count > 4 THEN true When twofa_attempt_count > 4 THEN true ELSE false END  where email = $1',
        values: [userParams.email],
      });
      db.callOneorNone(updateUserLoginAttempts);
      if (user.login_attempt_count >= 4)
        return { status: "fail", message: "Account Locked" };
      else return { status: "fail", message: "Invalid Credentials" };
    }
  }
  //IF THE EMAIL IS NOT FOUND LOCK THE IP AFTER 5 ATTEMPTS.
  else {
    return { status: "fail", message: "" };
  }
}

// async function UpdateSession(token, twofaCode, user, userParams) {
//   const insertSession = new PS({
//     name: "insert-session",
//     text:
//       'insert into "DSS".tbl_sessions_data(user_id, session_token, expiration_timestamp,ip_address, user_agent,  is_active, twofa_code, twofa_code_expiration)' +
//       "values($1, $2, $3, $4, $5, $6, $7, $8)",
//     values: [
//       user.user_id,
//       token,
//       "now()",
//       userParams.ipAddress,
//       userParams.userAgent,
//       false,
//       twofaCode,
//       "now()",
//     ],
//   });

//   const result = await db.callQuery(insertSession);
// }

//GENERATE AND SEND OTP TO THE USER
async function generateOTP(user) {
  if (user) {
    const otp = Math.floor(Math.random() * 899999 + 100000);
    email.sendEmail(
      user.email,
      "Login verification code",
      "Your DSS login verficiation code is " + otp
    );
    return otp;
  }
}

async function verify(token, code) {
  await redisClient.connect();
  const value = await redisClient.get(token);
  await redisClient.disconnect();
  //console.log(value);
  if (value) {
    if (value == code) {
      return { status: "success", message: "valid code" };
    } else {
      return { status: "failure", message: "invalid code" };
    }
  } else return { status: "failure", message: "invalid token" };
}

async function create(user) {
  //console.log("user", user);
  const result = await db.callFunction("DSS.usp_users_insert", [
    user.email,
    user.password,
    user.phone_number,
    user.name,
  ]);

  let success = "success";
  if (result["usp_users_insert"] == "-1") success = "Email already exists";
  else {
    success = "User created succesfully.";
  }
  return { success };
}

async function update(id, user) {
  /*  const result = await db.query(
        `UPDATE programming_languages 
    SET name=?, released_year=?, githut_rank=?, 
    pypl_rank=?, tiobe_rank=? 
    WHERE id=?`,
        [
          programmingLanguage.name,
          programmingLanguage.released_year,
          programmingLanguage.githut_rank,
          programmingLanguage.pypl_rank,
          programmingLanguage.tiobe_rank,
          id,
        ]
      );

      let message = "Error in updating programming language";

      if (result.affectedRows) {
        message = "Programming language updated successfully";
      }

      return { message };*/
}

async function remove(id) {
  /*const result = await db.query(
        `DELETE FROM programming_languages WHERE id=?`,
        [id]
      );

      let message = "Error in deleting programming language";

      if (result.affectedRows) {
        message = "Programming language deleted successfully";
      }

      return { message };*/
}

module.exports = {
  getAll,
  create,
  update,
  remove,
  getById,
  authenticate,
  verify,
};
