const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const auth = require("../utils/auth");

router.post("/v1/signup", auth.RateLimit(), userController.create);
router.get(
  "/v1/:id",
  auth.RateLimit(),
  auth.authorize(),
  userController.getById
);
router.post("/v1/signin", auth.RateLimit(), userController.signIn);
router.post(
  "/v1/verify",
  auth.RateLimit(),
  auth.verifyCSRF(),
  userController.verify
);
router.post("/v1/signout", auth.RateLimit(), userController.signOut);
router.post(
  "/v1/verifyRegistration",
  auth.RateLimit(),
  userController.verifyRegistration
);

module.exports = router;
