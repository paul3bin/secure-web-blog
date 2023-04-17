const blogService = require("../services/blog.service");
const Joi = require("joi");
const auth = require("../utils/auth");

async function getById(req, res, next) {
  try {
    // console.log("request", req.params.id);
    const blogSchema = Joi.object({
      id: Joi.string().required(),
    });
    if (blogSchema.validate(req.params).error) {
      res.send(blogSchema.validate(req.body).error.message);
    } else {
      res.json(await blogService.getById(req.params.id));
    }
  } catch (err) {
    console.error(`Error while getting users by id`, err.message);
    next(err);
  }
}

async function get(req, res, next) {
  try {
    res.send(await blogService.getAll(req.user));
  } catch (err) {
    console.error(`Error while getting blogs`, err.message);
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const blogSchema = Joi.object({
      title: Joi.string().required(),
      body: Joi.string().required(),
    }).options({ abortEarly: false });

    if (blogSchema.validate(req.body).error) {
      res.send(blogSchema.validate(req.body).error.message);
    } else {
      const blog = {
        title: req.body.title,
        body: req.body.body,
        posted_by: req.user._id,
        posted_timestamp: "now()",
      };
      const result = await blogService.create(blog);
      console.log(result);
      if (result.status == "pass")
        return res.status(200).send("Blog created succesfully");
      else if (result.status == "fail")
        return res.status(404).send("Error creating the blog");
      else if (result.status == "unauthorized")
        return res.status(401).send("Access Denied");
    }
  } catch (err) {
    console.error(`Error while creating blog`, err.message);
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const blogSchema = Joi.object({
      title: Joi.string().required(),
      body: Joi.string().required(),
      isPrivate: Joi.boolean(),
    }).options({ abortEarly: false });

    if (blogSchema.validate(req.body).error) {
      res.send(blogSchema.validate(req.body).error.message);
    } else {
      const blog = {
        title: req.body.title,
        body: req.body.body,
        posted_by: req.user._id,
        posted_timestamp: "now()",
        is_private: req.body.isPrivate,
      };
      const result = await blogService.update(req.params.id, blog);
      if (result.status == "unauthorized") {
        res.status(401).send("Access Denied");
      } else if (result.status == "fail") {
        res.status(404).send("Blog not found");
      } else if (result.status == "pass") {
        res.status(200).send("Blog updated succesfully.");
      }
    }
  } catch (err) {
    console.error(`Error while updating blog`, err.message);
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    if (req.params.id.length > 0) {
      res.json(await blogService.remove(req.params.id));
    }
  } catch (err) {
    console.error(`Error while deleting blog`, err.message);
    next(err);
  }
}

module.exports = {
  get,
  getById,
  create,
  update,
  remove,
};
