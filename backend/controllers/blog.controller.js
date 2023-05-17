const blogService = require("../services/blog.service");
const Joi = require("../utils/customjoi");
const auditService = require("../services/audit.service");
//const auth = require("../utils/auth");

async function getById(req, res, next) {
  try {
    // console.log("request", req.params.id);
    const blogSchema = Joi.object({
      id: Joi.number().integer().required(),
    });
    if (blogSchema.validate(req.params).error) {
      res.send(blogSchema.validate(req.body).error.message);
    } else {
      const result = await blogService.getById(req.params.id, req.user);
      auditService.create(
        req.user ? req.user._id : "",
        "Retrieve Blog By Id " + req.params.id,
        req.headers["x-forwarded-for"] || req.ip,
        req.headers["user-agent"],
        result.message,
        result.status
      );
      if (result.status == "pass") {
        res.status(200).send(result);
      } else if (result.status == "unauthorized") {
        res.status(404).send({ status: "fail", message: "Not Found" });
      } else {
        res.status(404).send(result);
      }
    }
  } catch (err) {
    console.error(`Error while getting users by id`, err.message);
    next(err);
  }
}

async function getByUser(req, res, next) {
  try {
    const result = await blogService.getByUser(req.user);
    auditService.create(
      req.user ? req.user._id : "",
      "Get For user " + req.user.id,
      req.headers["x-forwarded-for"] || req.ip,
      req.headers["user-agent"],
      result.message,
      result.status
    );
    if (result.status == "pass") {
      res.status(200).send(result);
    }
  } catch (err) {
    console.error(`Error while getting users by id`, err.message);
    next(err);
  }
}

async function get(req, res, next) {
  try {
    //console.log("requser", req.user);
    res.status(200).send(await blogService.getAll(req.user));
  } catch (err) {
    console.error(`Error while getting blogs`, err.message);
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const blogSchema = Joi.object({
      title: Joi.string().required().escapeHTML(),
      body: Joi.string().required().escapeHTML(),
      isPrivate: Joi.boolean(),
    }).options({ abortEarly: false });

    if (blogSchema.validate(req.body).error) {
      res.status(400).send(blogSchema.validate(req.body).error.message);
    } else {
      const blog = {
        title: req.body.title,
        body: req.body.body,
        posted_by: req.user._id,
        posted_timestamp: "now()",
        is_private: req.body.isPrivate,
      };
      const result = await blogService.create(blog);
      auditService.create(
        req.user ? req.user._id : "",
        "Create Blog",
        req.headers["x-forwarded-for"] || req.ip,
        req.headers["user-agent"],
        result.message,
        result.status
      );
      // console.log(result);
      if (result.status == "pass") return res.status(200).send(result);
      else if (result.status == "fail") return res.status(200).send(result);
    }
  } catch (err) {
    console.error(`Error while creating blog`, err.message);
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const blogSchema = Joi.object({
      title: Joi.string().required().escapeHTML(),
      body: Joi.string().required().escapeHTML(),
      isPrivate: Joi.boolean(),
    }).options({ abortEarly: false });

    if (blogSchema.validate(req.body).error) {
      res.status(400).send(blogSchema.validate(req.body).error.message);
    } else {
      const blog = {
        title: req.body.title,
        body: req.body.body,
        posted_by: req.user._id,
        posted_timestamp: "now()",
        is_private: req.body.isPrivate,
      };
      const result = await blogService.update(req.params.id, blog);
      auditService.create(
        req.user ? req.user._id : "",
        "Updated " + req.params.id,
        req.headers["x-forwarded-for"] || req.ip,
        req.headers["user-agent"],
        result.message,
        result.status
      );
      if (result.status == "unauthorized") {
        res.status(401).send("Access Denied");
      } else if (result.status == "fail") {
        res.status(404).send(result);
      } else if (result.status == "pass") {
        res.status(200).send(result);
      }
    }
  } catch (err) {
    console.error(`Error while updating blog`, err.message);
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const blogSchema = Joi.object({
      id: Joi.integer().required().escapeHTML(),
    }).options({ abortEarly: false });

    if (blogSchema.validate(req.params).error) {
      res.status(400).send(blogSchema.validate(req.body).error.message);
    } else {
      result = await blogService.remove(req.params.id, req.user);
      auditService.create(
        req.user ? req.user._id : "",
        "Remove Blog By Id " + req.params.id,
        req.headers["x-forwarded-for"] || req.ip,
        req.headers["user-agent"],
        result.message,
        result.status
      );
      if (result.status == "pass") {
        return res.status(200).send(result);
      } else if (result.status == "fail") {
        return res.status(400).send(result);
      }
      res.json();
    }
  } catch (err) {
    console.error(`Error while deleting blog`, err.message);
    next(err);
  }
}

async function search(req, res, next) {
  try {
    const blogSchema = Joi.object({
      search: Joi.string().required().escapeHTML(),
    }).options({ abortEarly: false });

    if (blogSchema.validate(req.body).error) {
      res.status(400).send(blogSchema.validate(req.body).error.message);
    } else {
      const result = await blogService.search(req.body.search, req.user);
      auditService.create(
        req.user ? req.user._id : "",
        "Search Blog By criteria " + req.body.search,
        req.headers["x-forwarded-for"] || req.ip,
        req.headers["user-agent"],
        result.message,
        result.status
      );
      res.status(200).send(result);
    }
  } catch (err) {
    console.error(`Error while searching`, err.message);
    next(err);
  }
}

module.exports = {
  get,
  getById,
  create,
  update,
  remove,
  getByUser,
  search,
};
