const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const auth = require("../utils/auth");

router.post("/v1/signup", userController.create);
router.get("/v1/:id", auth.authorize(), userController.getById);
router.post("/v1/signin", userController.signIn);
router.post("/v1/verify", auth.verifyCSRF(), userController.verify);
router.post("/v1/signout", userController.signOut);
router.post("/v1/verifyRegistration", userController.verifyRegistration);

module.exports = router;
