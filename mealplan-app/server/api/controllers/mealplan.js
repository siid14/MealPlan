const mongoose = require("mongoose");
const MealPlan = require("../models/Mealplan");

const mealPlanController = {
  // Create or update meal plan
  createOrUpdate: async (req, res) => {
    try {
      console.log("📝 Creating/Updating meal plan:", req.body);
      const { week, meal, mealplanId } = req.body;

      // Validate input
      if (!week || !meal) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      let mealPlan;

      if (mealplanId) {
        // Validate mealplanId format
        if (!mongoose.Types.ObjectId.isValid(mealplanId)) {
          return res.status(400).json({ error: "Invalid meal plan ID format" });
        }

        // Update existing meal plan
        mealPlan = await MealPlan.findOne({
          _id: mealplanId,
          userId: req.user._id, // Ensure user owns the meal plan
        });

        if (!mealPlan) {
          return res.status(404).json({ error: "Meal plan not found" });
        }

        // Add new meal to the meals array
        mealPlan.meals.push({
          recipeId: meal.mealId,
          title: meal.name,
          diets: meal.diets,
          image: meal.image,
        });

        // Save updated meal plan
        await mealPlan.save();
        console.log("✅ Meal plan updated successfully");
      } else {
        // Create new meal plan
        mealPlan = new MealPlan({
          userId: req.user._id,
          week,
          meals: [
            {
              recipeId: meal.mealId,
              title: meal.name,
              diets: meal.diets,
              image: meal.image,
            },
          ],
        });

        await mealPlan.save();
        console.log("✅ New meal plan created successfully");
      }

      res.status(201).json(mealPlan);
    } catch (error) {
      console.error("❌ Error in meal plan creation/update:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          error: "Validation error",
          message: error.message,
        });
      }

      if (error.kind === "ObjectId") {
        return res.status(400).json({ error: "Invalid meal plan ID format" });
      }

      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Delete meal plan
  delete: async (req, res) => {
    try {
      console.log("🗑️ Deleting meal plan:", req.params.id);
      const mealplanId = req.params.id;

      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(mealplanId)) {
        return res.status(400).json({ error: "Invalid meal plan ID format" });
      }

      const deletedMealPlan = await MealPlan.findOneAndDelete({
        _id: mealplanId,
        userId: req.user._id, // Ensure user owns the meal plan
      });

      if (!deletedMealPlan) {
        return res.status(404).json({ error: "Meal plan not found" });
      }

      console.log("✅ Meal plan deleted successfully");
      res.json({
        message: "Meal plan deleted successfully",
        id: deletedMealPlan._id,
      });
    } catch (error) {
      console.error("❌ Error in meal plan deletion:", error);

      if (error.kind === "ObjectId") {
        return res.status(400).json({ error: "Invalid meal plan ID format" });
      }

      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Get user's meal plans
  getUserMealPlans: async (req, res) => {
    try {
      console.log("📋 Fetching meal plans for user:", req.user._id);
      const mealPlans = await MealPlan.find({
        userId: req.user._id,
      })
        .sort({ week: 1 })
        .populate("userId", "username preferences");

      console.log(`✅ Found ${mealPlans.length} meal plans`);
      res.json(mealPlans);
    } catch (error) {
      console.error("❌ Error fetching meal plans:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Get specific meal plan
  getMealPlan: async (req, res) => {
    try {
      console.log("🔍 Fetching meal plan:", req.params.id);

      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid meal plan ID format" });
      }

      const mealPlan = await MealPlan.findOne({
        _id: req.params.id,
        userId: req.user._id,
      }).populate("userId", "username preferences");

      if (!mealPlan) {
        console.log("❌ Meal plan not found");
        return res.status(404).json({ error: "Meal plan not found" });
      }

      console.log("✅ Meal plan found successfully");
      res.json(mealPlan);
    } catch (error) {
      console.error("❌ Error fetching meal plan:", error);

      if (error.kind === "ObjectId") {
        return res.status(400).json({ error: "Invalid meal plan ID format" });
      }

      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Update specific meal in a meal plan
  updateMeal: async (req, res) => {
    try {
      console.log("📝 Updating meal in plan:", {
        mealplanId: req.params.mealplanId,
        mealId: req.params.mealId,
      });

      const { mealplanId, mealId } = req.params;
      const updatedMealData = req.body;

      // Validate mealplanId format
      if (!mongoose.Types.ObjectId.isValid(mealplanId)) {
        return res.status(400).json({ error: "Invalid meal plan ID format" });
      }

      const mealPlan = await MealPlan.findOne({
        _id: mealplanId,
        userId: req.user._id,
      });

      if (!mealPlan) {
        return res.status(404).json({ error: "Meal plan not found" });
      }

      // Find and update the specific meal
      const mealIndex = mealPlan.meals.findIndex(
        (meal) => meal._id.toString() === mealId
      );

      if (mealIndex === -1) {
        return res.status(404).json({ error: "Meal not found in plan" });
      }

      // Update meal data
      mealPlan.meals[mealIndex] = {
        ...mealPlan.meals[mealIndex].toObject(),
        ...updatedMealData,
      };

      await mealPlan.save();
      console.log("✅ Meal updated successfully in plan");

      res.json(mealPlan);
    } catch (error) {
      console.error("❌ Error updating meal in plan:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          error: "Validation error",
          message: error.message,
        });
      }

      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },
};

module.exports = mealPlanController;
