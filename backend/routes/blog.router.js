const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog.controller");
const util = require("../utils/auth");

router.post(
  "/v1/",
  /* util.RateLimit(),*/
  util.authorize(),
  util.verifyCSRF(),
  blogController.create
);
router.post(
  "/search/v1",
  /* util.RateLimit(),*/
  util.allow(),
  blogController.search
);
router.get("/v1/", /*util.RateLimit(),*/ util.allow(), blogController.get);
router.get(
  "/v1/:id",
  /*util.RateLimit(),*/ util.allow(),
  blogController.getById
);
router.get(
  "/user/v1",
  /*util.RateLimit(),*/
  util.authorize(),
  blogController.getByUser
);
router.delete(
  "/v1/:id",
  /*util.RateLimit(),*/
  util.authorize(),
  util.verifyCSRF(),
  blogController.remove
);
router.put(
  "/v1/:id",
  /*util.RateLimit(),*/
  util.authorize(),
  util.verifyCSRF(),
  blogController.update
);

module.exports = router;
