const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const blogController = require("../controllers/blog.controller");
const util = require("../utils/auth");

router.post("/v1/signup", userController.create);
router.get("/v1/:id", util.authorize(), userController.getById);
router.post("/v1/signin", userController.signIn);
router.post("/v1/verify", userController.verify);

module.exports = router;
