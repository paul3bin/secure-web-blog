const db = require("./db.service");
const auth = require("../utils/auth");
const { PreparedStatement: PS } = require("pg-promise");
const jwt = require("jsonwebtoken");
const emailService = require("./email.service");
const redis = require("redis");
const { required } = require("joi");
const redisClient = redis.createClient({ url: process.env.REDIS_URL });
const crypto = require("crypto");

// Asynchronous function for generating CSRF tokens and encoding it into base64 string.
// Reference: https://www.tutorialspoint.com/node-js-base64-encoding-and-decoding and
// https://www.geeksforgeeks.org/node-js-crypto-randombytes-method/
async function generateCSRFToken() {
  return Buffer.from(crypto.randomBytes(64).toString("hex"), "hex").toString(
    "base64"
  );
}

async function getById(id) {
  // console.log("id", id);
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
    return { status: "pass", data: result };
  } else {
    return { status: "fail", data: null };
  }
  return result;
}

async function getAll() {}

async function authenticate(userParams, ipaddress, userAgent) {
  userParams["ipAddress"] = ipaddress.replace("::1", "localhost");
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
    if (!user.is_activated) {
      return {
        status: "fail",
        message: "Activate your account",
      };
    }
    if (user.lock_account) {
      //  console.log("inside user account locked");
      return {
        status: "fail",
        message: "Your account is locked. Please contact the administrator",
      };
    }
    //console.log("inside user", userParams);
    const validPassword = await auth.comparePassword(
      userParams.password,
      user.password_hash
    );
    if (validPassword) {
      //console.log(user.user_id.toString());
      const token = jwt.sign(
        {
          _id: user.user_id,
          ipAddress: userParams.ipAddress,
          userAgent: userParams.userAgent,
          email: user.email,
        },
        process.env.DSS_SECRET_KEY,
        { expiresIn: "2d" }
      );
      const email_type = "login";
      const otp = await generateOTP(user, email_type);
      console.log("otp", otp);
      // Calling function to generate csrf token
      const csrf_token = await generateCSRFToken();
      //console.log(`csrf-token ${csrf_token}`);

      await redisClient.connect();
      await redisClient.set(
        token,
        JSON.stringify({
          _id: user.user_id,
          value: otp,
          email: user.email,
          ipAddress: userParams.ipAddress,
          userAgent: userParams.userAgent,
          active: false,
          csrfToken: csrf_token, // adding csrf token to redis
        }),
        {
          EX: process.env.DSS_SESSION_TIMEOUT,
          //EX: 720,
        }
      );
      await redisClient.quit();
      return { body: { status: "pass", token: token }, csrf_token: csrf_token };
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
      if (user.login_attempt_count > 4)
        return {
          status: "fail",
          message: "Your Account is Locked. Please contact the administrator",
        };
      else return { status: "fail", message: "Invalid Credentials" };
    }
  }
  //IF THE EMAIL IS NOT FOUND LOCK THE IP AFTER 5 ATTEMPTS.
  else {
    return { status: "fail", message: "Invalid Credentials" };
  }
}

//GENERATE AND SEND OTP TO THE USER
async function generateOTP(user, email_type) {
  if (user) {
    const otp = Math.floor(Math.random() * 899999 + 100000);
    auth
      .decryptData(user.email)
      .then((result) => emailService.sendOTP(result, otp, email_type));

    return otp;
  }
}

async function verifyRegistration(token, code) {
  await redisClient.connect();
  const userToken = JSON.parse(await redisClient.get(token));
  await redisClient.quit();

  if (userToken) {
    if (userToken == code) {
      const updateUser = new PS({
        name: "update-user",
        text: 'Update "DSS".tbl_users_data set is_activated = true where email = $1',
        values: [token],
      });
      await db.callOneorNone(updateUser);
      await redisClient.connect();
      await redisClient.del(token);
      await redisClient.quit();
      return { status: "pass", message: "User verified" };
    } else {
      return { status: "fail", message: "invalid code" };
    }
  }
}

async function verify(token, code) {
  await redisClient.connect();
  const otp = JSON.parse(await redisClient.get(token));
  await redisClient.quit();
  if (otp) {
    console.log(otp);
    if (otp.value == code) {
      await redisClient.connect();
      redisClient.del(token);
      token = jwt.sign(
        {
          _id: otp._id,
          ipAddress: otp.ipAddress,
          userAgent: otp.userAgent,
          email: otp.email,
          active: true,
        },
        process.env.DSS_SECRET_KEY,
        { expiresIn: "2d" }
      );
      await redisClient.set(
        token,
        JSON.stringify({
          _id: otp._id,
          email: otp.email,
          ipAddress: otp.ipAddress,
          userAgent: otp.userAgent,
          active: true,
        }),
        {
          EX: process.env.DSS_SESSION_TIMEOUT,
          //EX: 720,
        }
      );
      await redisClient.quit();
      //console.log(token);
      return { status: "pass", message: "User activated", token: token };
    } else {
      //increment 2fa attempt count
      const updateUserTwofaAttempts = new PS({
        name: "update-user-twofa-attempts",
        text: 'Update "DSS".tbl_users_data set twofa_attempt_count = twofa_attempt_count + 1, lock_account =  CASE WHEN login_attempt_count > 4 THEN true When twofa_attempt_count > 4 THEN true ELSE false END  where email = $1 Returning lock_account ',
        values: [otp.email],
      });
      const result = await db.callOneorNone(updateUserTwofaAttempts);
      //console.log(result);
      if (result && result.lock_account) {
        return {
          status: "failure",
          message: "Your Account is Locked. Please contact the adminstrator.",
        };
      }
      return { status: "fail", message: "invalid code" };
    }
  } else return { status: "fail", message: "invalid code" };
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
  if (result["usp_users_insert"] == "-1") {
    return { status: "fail", message: "Email already exists" };
  } else {
    const email_type = "registeration";
    const otp = await generateOTP(user, email_type);
    console.log("otp", otp);
    await redisClient.connect();
    await redisClient.set(user.email, otp, {
      EX: process.env.DSS_SESSION_TIMEOUT,
      //EX: 720,
    });
    await redisClient.quit();
    return {
      status: "pass",
      message: "User created succesfully",
      token: user.email,
    };
  }
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

async function signOut(token) {
  console.log("logging out");
  await redisClient.connect();
  const found = JSON.parse(await redisClient.get(token));
  //console.log(found);
  if (found) {
    await redisClient.del(token);
    await redisClient.quit();
    return { status: "pass", message: "You have been Logged Out" };
  } else {
    await redisClient.quit();
    return { status: "fail", message: "Invalid Session" };
  }
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
  signOut,
  generateCSRFToken,
  verifyRegistration,
};
