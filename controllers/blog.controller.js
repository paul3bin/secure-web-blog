const blogService = require("../services/blog.service");

async function get(req, res, next) {
  try {
    //res.json(await programmingLanguages.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error while getting blogs`, err.message);
    next(err);
  }
}

async function create(req, res, next) {
  try {
    //  res.json(await programmingLanguages.create(req.body));
  } catch (err) {
    console.error(`Error while creating blog`, err.message);
    next(err);
  }
}

async function update(req, res, next) {
  try {
    // res.json(await programmingLanguages.update(req.params.id, req.body));
  } catch (err) {
    console.error(`Error while updating blog`, err.message);
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    // res.json(await programmingLanguages.remove(req.params.id));
  } catch (err) {
    console.error(`Error while deleting blog`, err.message);
    next(err);
  }
}

module.exports = {
  get,
  create,
  update,
  remove,
};
