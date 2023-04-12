const argon2 = require("argon2-ffi").argon2i;
const crypto = require("crypto");
const util = require("util");
const randomBytes = util.promisify(crypto.randomBytes);
const env = process.env;
var jwt = require("jsonwebtoken");

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

function authCheck(req, res, next) {
  /* if (!req.session.isLoggedIn || !req.session.user.user_id) {
    next(
      createError(401, "You are not authorized", {
        refererUri: new URL(req.headers.referer).pathname,
      })
    );
    return;
  }
  next();*/
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

  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

// Decrypt data
async function decryptData(text) {
  let textParts = text.split(":");
  let iv = Buffer.from(textParts.shift(), "hex");
  let encryptedText = Buffer.from(textParts.join(":"), "hex");
  let decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(process.env.DSS_SECRET_KEY),
    iv
  );
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

module.exports = {
  authCheck,
  hashPassword,
  comparePassword,
  encryptData,
  decryptData,
};
