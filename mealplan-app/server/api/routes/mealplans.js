const express = require("express");
const router = express.Router();
const mealPlanController = require("../controllers/mealplan");
const authMiddleware = require("../middleware/authorization");

// All meal plan routes require authentication
router.use(authMiddleware);

// Create or update meal plan
router.post("/", mealPlanController.createOrUpdate);

// Get all meal plans for user
router.get("/", mealPlanController.getUserMealPlans);

// Get specific meal plan
router.get("/:id", mealPlanController.getMealPlan);

// Delete meal plan
router.delete("/:id", mealPlanController.delete);

module.exports = router;
