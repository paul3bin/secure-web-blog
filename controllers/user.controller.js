const userService = require("../services/user.service");
const Joi = require("joi");
const auth = require("../utils/auth");

async function get(req, res, next) {
  /*  try {
    res.json(await userService.getAll());
  } catch (err) {
    console.error(`Error while getting users`, err.message);
    next(err);
  }*/
}

async function getById(req, res, next) {
  try {
    // console.log("request", req.params.id);
    const userSchema = Joi.object({
      id: Joi.string().required(),
    });
    if (userSchema.validate(req.params).error) {
      res.send(userSchema.validate(req.body).error.message);
    } else {
      res.json(await userService.getById(req.params.id));
    }
  } catch (err) {
    console.error(`Error while getting users by id`, err.message);
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const userSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string()
        .required()
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
      phone_number: Joi.string().allow(""),
      name: Joi.string().required(),
    }).options({ abortEarly: false });

    if (userSchema.validate(req.body).error) {
      res.send(userSchema.validate(req.body).error.message);
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
      if (result != null) {
        if (result.status == "fail") {
          res.status(406).send(result);
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
    req.body.email = await auth.encryptData(req.body.email);
    const result = await userService.authenticate(
      req.body,
      req.headers["x-forwarded-for"] || req.ip,
      req.headers["user-agent"]
    );
    //if (result.status == "fail") {
    //   return res.status(401).json(result);
    // } else {
    if (result) return res.status(200).json(result);
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

    if (userSchema.validate(req.body).error) {
      return res.status(406).json(userSchema.validate(req.body).error.message);
    } else {
      const result = await userService.verify(token, req.body.otp);
      if (result.status == "fail") {
        return res.status(401).json(result);
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

module.exports = {
  get,
  getById,
  create,
  update,
  remove,
  signIn,
  verify,
};
