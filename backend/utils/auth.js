const argon2 = require("argon2-ffi").argon2i;
const crypto = require("crypto");
const util = require("util");
const randomBytes = util.promisify(crypto.randomBytes);
const env = process.env;
var jwt = require("jsonwebtoken");
const redis = require("redis");
const redisClient = redis.createClient({ url: process.env.REDIS_URL });

async function hashPassword(password) {
  try {
    return randomBytes(32).then((salt) => argon2.hash(password, salt));
  } catch (e) {
    console.log("Error hashing password with argon2", e);
  }
}

async function comparePassword(password, hashedPassword) {
  try {
    const pass = Buffer.from(password);
    const correct = await argon2.verify(hashedPassword, pass);
    if (correct) {
      return true;
    }
    return false;
  } catch (e) {
    console.log("Error argon2 verification", e);
  }
}

// Encrypt data
async function encryptData(text) {
  //let iv = crypto.randomBytes(16);
  //let key = crypto.randomBytes(32);
  // console.log("iv", iv.toString("hex"));
  // console.log("key", key.toString("hex"));
  let iv = Buffer.from(process.env.DSS_IV, "hex");
  let key = Buffer.from(process.env.DSS_SECRET_KEY, "hex");
  // console.log("iv", iv.toString("hex"));
  //console.log("secret_key", (await randomBytes(32)).toString("hex"));
  let cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return process.env.DSS_IV + ":" + encrypted.toString("hex");
}

// Decrypt data
async function decryptData(text) {
  let textParts = text.split(":");
  let iv = Buffer.from(textParts.shift(), "hex");
  let encryptedText = Buffer.from(textParts.join(":"), "hex");
  let decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(process.env.DSS_SECRET_KEY, "hex"),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  //console.log("decrypt data", decrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

function allow() {
  return async (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
      req.user = null;
    } else {
      await jwt.verify(
        token,
        process.env.DSS_SECRET_KEY,
        async function (err, decoded) {
          if (err) {
            req.user = null;
          }
          await redisClient.connect();
          const data = await redisClient.get(token);
          await redisClient.disconnect();
          if (data == null) {
            //console.log("data", null);
            req.user = null;
          } else if (JSON.parse(data).active == false) {
            req.user = null;
          } else {
            req.user = decoded;
            //console.log("user", req.user);
          }
        }
      );
    }
    next();
  };
}

function authorize() {
  /* This function will act as middleware for authorising user before
   the action for the URL is carried out */
  return (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(401).send({ status: "fail", message: "Access Denied" });
    } else {
      jwt.verify(
        token,
        process.env.DSS_SECRET_KEY,
        async function (err, decoded) {
          if (err) {
            //Not a valid JWT Token.
            return res
              .status(401)
              .send({ status: "fail", message: "Access Denied" });
          }
          if (
            decoded.ipAddress != req.ip.replace("::1", "localhost") ||
            decoded.userAgent != req.headers["user-agent"]
          ) {
            //Request didn't come from the same ip and useragent as the token
            return res
              .status(401)
              .send({ status: "fail", message: "Access Denied" });
          } else {
            await redisClient.connect();
            const data = await redisClient.get(token);
            // console.log(data);
            await redisClient.disconnect();
            if (data == null) {
              //Token expired or not found
              //console.log("invalid here 2");
              return res
                .status(401)
                .send({ status: "unauthorised", message: "Access Denied" });
            } else if (JSON.parse(data).active == false) {
              //User not active
              return res
                .status(401)
                .send({ status: "unauthorised", message: "Access Denied" });
            } else {
              redisClient.connect();
              redisClient.set(token, data, {
                EX: 720,
              });
              req.user = decoded;
            }
            next();
          }
        }
      );
    }
  };
}

function verifyCSRF() {
  /*
  function that will act as a middleware to verify CSRF token before all 
  POST, PUT and DELETE request are carried out
  */
  return (req, res, next) => {
    // getting the csrf token and authorisation token from header
    const csrf_token = req.headers["x-csrf-token"];
    const token = req.headers["authorization"];

    // checking if token is received
    if (csrf_token) {
      // checking if request method is a POST or, PUT, or DELETE
      if (req.method in ["POST", "PUT", "DELETE"]) {
        // connecting to redis database and getting the stored data based on user auth token
        redisClient.connect();
        const data = redisClient.get(token);

        // checking if data is present or not
        if (data) {
          data.then((value) => {
            // comparing the stored and received csrf token
            if (JSON.parse(value).csrfToken == csrf_token) {
              next();
            } else {
              return res
                .status(401)
                .send({ status: "unauthorised", message: "Access Denied" });
            }
          });
        } else {
          return res
            .status(401)
            .send({ status: "unauthorised", message: "Access Denied" });
        }
      } else {
        next();
      }
    } else {
      return res
        .status(401)
        .send({ status: "unauthorised", message: "Access Denied" });
    }
  };
}

module.exports = {
  hashPassword,
  comparePassword,
  encryptData,
  decryptData,
  authorize,
  allow,
  verifyCSRF,
};
