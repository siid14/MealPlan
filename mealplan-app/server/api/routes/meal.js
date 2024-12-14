const express = require("express");
const router = express.Router();
const mealController = require("../controllers/meal");
const authMiddleware = require("../middleware/authorization");

// All routes require authentication
router.use(authMiddleware);

// Search meals
router.get("/search", mealController.searchMeals);

// Get meal details by ID (optional)
router.get("/:id", mealController.getMealDetails);

module.exports = router;
