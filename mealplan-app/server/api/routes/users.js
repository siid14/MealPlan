const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const authMiddleware = require("../middleware/authorization");

// public routes
router.post("/register", userController.register);
router.post("/login", userController.login);

// protected routes
router.use(authMiddleware);
router.get("/:id", userController.getUserInfo);
router.put("/:id", userController.updatePreferences);

module.exports = router;
