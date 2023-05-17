const userService = require("../services/user.service");
const Joi = require("../utils/customjoi");
const auth = require("../utils/auth");
const auditService = require("../services/audit.service");

async function get(req, res, next) {
  /*  try {
    res.json(await userService.getAll());
  } catch (err) {
    console.error(`Error while getting users`, err.message);
    next(err);
  }*/
}

//Get the User info by passing the identifier.
async function getById(req, res, next) {
  try {
    // console.log("request", req.params.id);
    const userSchema = Joi.object({
      id: Joi.string().required().escapeHTML(),
    }); //Check if id is sent

    if (userSchema.validate(req.params).error) {
      //Required data not filled
      res.status(400).send(userSchema.validate(req.body).error.message); // BAD REQUEST
    } else {
      const result = await userService.getById(req.params.id);
      auditService.create(
        req.user ? req.params.id : "",
        "Get User By Id " + id,
        req.headers["x-forwarded-for"] || req.ip,
        req.headers["user-agent"],
        result.message,
        result.status
      );
      if (result) {
        if (result.status == "fail") {
          //User Info not found
          res.status(404).send(result);
        } else if (result.status == "pass") {
          res.status(200).send(result); //User Found
        }
      }
    }
  } catch (err) {
    console.error(`Error while getting users by id`, err.message);
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const userSchema = Joi.object({
      email: Joi.string().email().required().escapeHTML(),
      password: Joi.string()
        .required()
        .escapeHTML()
        .min(8)
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*~])[A-Za-z\d!@#$%^&*~]{8,}$/
        )
        .error((errors) => {
          // console.log("password-errors", errors);
          errors.forEach((err) => {
            err.message =
              '"Password" must contain atleast 8 characters, one uppercase, one lowercase, one digit and a special character @$!%*?&';
          });
          return errors;
        }),
      phone_number: Joi.string()
        .allow("")
        .optional()
        .regex(/^[0-9]{10,11}$/)
        .label("phone_number")
        .error((errors) => {
          errors.forEach((err) => {
            err.message = "Phone number must be valid";
          });
          return errors;
        }),
      name: Joi.string().required().escapeHTML(),
    }).options({ abortEarly: false });

    if (userSchema.validate(req.body).error) {
      res.status(400).send(userSchema.validate(req.body).error.message);
    } else {
      const hashedPassword = await auth.hashPassword(req.body.password);
      const encryptedName = await auth.encryptData(req.body.name);
      const encrypedPhone = await auth.encryptData(req.body.phone_number);
      const encryptedEmail = await auth.encryptData(req.body.email);
      const user = {
        email: encryptedEmail,
        password: hashedPassword,
        phone_number: encrypedPhone,
        name: encryptedName,
      };
      const result = await userService.create(user);
      auditService.create(
        "",
        "Created User " + encryptedEmail,
        req.headers["x-forwarded-for"] || req.ip,
        req.headers["user-agent"],
        result.message,
        result.status
      );
      if (result != null) {
        if (result.status == "fail") {
          res.status(200).send(result);
        } else if (result.status == "pass") {
          res.status(200).send(result);
        }
      }
    }
  } catch (err) {
    console.error(`Error while creating user`, err.message);
    next(err);
  }
}

async function signIn(req, res, next) {
  try {
    const userSchema = Joi.object({
      email: Joi.string().required().escapeHTML(),
      password: Joi.string().required().escapeHTML(),
    });

    if (userSchema.validate(req.body).error) {
      res.status(400).send(userSchema.validate(req.body).error.message);
    } else {
      // decoding encoded email received from frontend and encrypting it
      req.body.email = await auth.encryptData(
        decodeURIComponent(req.body.email)
      );

      // decoding encoded password received from frontend
      req.body.password = decodeURIComponent(req.body.password);

      const result = await userService.authenticate(
        req.body,
        req.headers["x-forwarded-for"] || req.ip,
        req.headers["user-agent"]
      );
      auditService.create(
        "",
        "Sign In " + req.body.email,
        req.headers["x-forwarded-for"] || req.ip,
        req.headers["user-agent"],
        result.message,
        result.status
      );
      //if (result.status == "fail") {
      //   return res.status(401).json(result);
      // } else {
      if (result) {
        if (result.body && result.body.status == "pass") {
          //console.log("pass");
          res.setHeader("X-CSRF-Token", result.csrf_token);
          return res.status(200).json(result.body);
        } else {
          //console.log("inside fail", result);
          return res.status(200).json(result);
        }
      }
    }
    //}
  } catch (err) {
    console.error(`Error while signing user`, err.message);
    next(err);
  }
}

async function verify(req, res, next) {
  const token = req.headers["authorization"];
  if (token) {
    const userSchema = Joi.object({
      otp: Joi.string()
        .required()
        .length(6)
        .regex(/^[0-9]+$/),
    });

    if (userSchema.validate(req.body, { escapeHtml: true }).error) {
      return res.status(400).json(userSchema.validate(req.body).error.message); //BAD REQUEST
    } else {
      const result = await userService.verify(token, req.body.otp);
      auditService.create(
        "",
        "Verify otp for user ",
        req.headers["x-forwarded-for"] || req.ip,
        req.headers["user-agent"],
        result.message,
        result.status
      );
      if (result.status == "fail") {
        return res.status(200).json(result);
      } else {
        return res.status(200).json(result);
      }
    }
  } else {
    return res.status(400).json({ status: "fail", message: "Bad Request" });
  }
}

async function verifyRegistration(req, res, next) {
  const token = req.headers["authorization"];
  if (token) {
    const userSchema = Joi.object({
      otp: Joi.string()
        .required()
        .length(6)
        .regex(/^[0-9]+$/),
    });

    if (userSchema.validate(req.body).error) {
      return res.status(400).json(userSchema.validate(req.body).error.message);
    } else {
      const result = await userService.verifyRegistration(token, req.body.otp);
      auditService.create(
        "",
        "Verify registration ",
        req.headers["x-forwarded-for"] || req.ip,
        req.headers["user-agent"],
        result.message,
        result.status
      );
      if (result.status == "fail") {
        return res.status(200).json(result);
      } else {
        return res.status(200).json(result);
      }
    }
  } else {
    return res.status(400).json({ status: "fail", message: "Bad Request" });
  }
}

async function update(req, res, next) {
  try {
  } catch (err) {
    console.error(`Error while updating user`, err.message);
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    // res.json(await programmingLanguages.remove(req.params.id));
  } catch (err) {
    console.error(`Error while deleting user`, err.message);
    next(err);
  }
}

async function signOut(req, res, next) {
  try {
    const token = req.headers["authorization"];

    if (token) {
      const result = await userService.signOut(token);
      auditService.create(
        "",
        "User Signed Out ",
        req.headers["x-forwarded-for"] || req.ip,
        req.headers["user-agent"],
        result.message,
        result.status
      );
      if (result.status == "pass") res.status(200).send(result);
      else res.status(200).send(result);
    } else {
      res.status(400).send("Bad request");
    }
  } catch {}
}

module.exports = {
  get,
  getById,
  create,
  update,
  remove,
  signIn,
  verify,
  signOut,
  verifyRegistration,
};
