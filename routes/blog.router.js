const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog.controller");
const util = require("../utils/auth");

router.post("/v1/", util.authorize(), blogController.create);
router.get("/v1/", util.allow(), blogController.get);
router.get("/v1/:id", util.allow(), blogController.getById);
router.delete("/v1/", util.authorize(), blogController.remove);
router.put("/v1/:id", util.authorize(), blogController.update);

module.exports = router;
