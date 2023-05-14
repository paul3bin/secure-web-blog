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
  return (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(401).send("Access Denied");
    } else {
      jwt.verify(
        token,
        process.env.DSS_SECRET_KEY,
        async function (err, decoded) {
          if (err) {
            return res.status(400).send({ message: "Bad Request" });
          }
          if (
            decoded.ipAddress != req.ip.replace("::1", "localhost") ||
            decoded.userAgent != req.headers["user-agent"]
          ) {
            return res
              .status(401)
              .send({ status: "unauthorised", message: "Invalid session" });
          } else {
            await redisClient.connect();
            const data = await redisClient.get(token);
            // console.log(data);
            await redisClient.disconnect();
            if (data == null) {
              return res
                .status(401)
                .send({ status: "unauthorised", message: "Invalid Session" });
            } else if (JSON.parse(data).active == false) {
              return res
                .status(401)
                .send({ status: "unauthorised", message: "Invalid Session" });
            } else {
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
                .status(403)
                .send({ status: "unauthorised", message: "Invalid request" });
            }
          });
        } else {
          return res
            .status(403)
            .send({ status: "unauthorised", message: "Invalid request" });
        }
      } else {
        next();
      }
    } else {
      return res
        .status(403)
        .send({ status: "unauthorised", message: "Invalid request" });
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
