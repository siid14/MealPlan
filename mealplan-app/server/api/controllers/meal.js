const axios = require("axios");
const User = require("../models/User");

const mealController = {
  // Search meals from Spoonacular API
  searchMeals: async (req, res) => {
    try {
      console.log("📍 Starting meal search...");
      const { meal } = req.query;

      // Validate search query
      if (!meal) {
        console.log("❌ Missing meal query parameter");
        return res.status(400).json({
          error: "Meal query parameter is required",
        });
      }

      // Get user's dietary preferences
      const user = await User.findById(req.user._id);
      if (!user) {
        console.log("❌ User not found:", req.user._id);
        return res.status(404).json({ error: "User not found" });
      }

      const userDiets = user.preferences || [];
      console.log("👤 User preferences:", userDiets);

      // Call Spoonacular API with API key in URL
      console.log(`🔍 Searching for: ${meal}, with diets:`, userDiets);
      try {
        const baseUrl = "https://api.spoonacular.com/recipes/complexSearch";
        const response = await axios.get(
          `${baseUrl}?apiKey=${process.env.SPOONACULAR_API_KEY}`,
          {
            params: {
              query: meal,
              diet: userDiets.join(","),
              number: 10,
              addRecipeInformation: true,
              fillIngredients: true,
            },
            timeout: 8000,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log(`✅ Found ${response.data.results.length} meals`);

        // Transform the response
        const meals = response.data.results.map((recipe) => ({
          mealId: recipe.id,
          name: recipe.title,
          diets: recipe.diets,
          image: recipe.image,
          readyInMinutes: recipe.readyInMinutes,
          servings: recipe.servings,
          sourceUrl: recipe.sourceUrl,
          summary: recipe.summary,
          healthScore: recipe.healthScore,
        }));

        res.json({
          results: meals,
          total: response.data.totalResults,
          offset: response.data.offset || 0,
          query: meal,
        });
      } catch (apiError) {
        console.error("🔥 Spoonacular API error:", {
          status: apiError.response?.status,
          data: apiError.response?.data,
          message: apiError.message,
        });

        if (apiError.response) {
          switch (apiError.response.status) {
            case 401:
              return res.status(500).json({
                error: "Invalid API key",
                message: "Please check your API key configuration",
              });
            case 402:
              return res.status(503).json({
                error: "API quota exceeded",
                message: "Please try again later",
              });
            case 429:
              return res.status(429).json({
                error: "Too many requests",
                message: "Please try again in a few minutes",
              });
            default:
              return res.status(apiError.response.status).json({
                error: "External API error",
                message:
                  apiError.response.data.message || "Unexpected error occurred",
              });
          }
        } else if (apiError.request) {
          return res.status(504).json({
            error: "External API timeout",
            message: "The recipe service is not responding. Please try again",
          });
        } else {
          return res.status(500).json({
            error: "API request setup failed",
            message: apiError.message,
          });
        }
      }
    } catch (error) {
      console.error("💥 Internal error in meal search:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "An unexpected error occurred",
      });
    }
  },

  getMealDetails: async (req, res) => {
    try {
      console.log("📍 Fetching meal details...");
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "Meal ID is required" });
      }

      const baseUrl = `https://api.spoonacular.com/recipes/${id}/information`;
      const response = await axios.get(
        `${baseUrl}?apiKey=${process.env.SPOONACULAR_API_KEY}`,
        {
          timeout: 8000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`✅ Retrieved details for meal ID: ${id}`);

      const mealDetails = {
        mealId: response.data.id,
        name: response.data.title,
        diets: response.data.diets,
        image: response.data.image,
        readyInMinutes: response.data.readyInMinutes,
        servings: response.data.servings,
        ingredients: response.data.extendedIngredients,
        instructions: response.data.instructions,
        sourceUrl: response.data.sourceUrl,
        summary: response.data.summary,
        healthScore: response.data.healthScore,
        cuisines: response.data.cuisines,
        dishTypes: response.data.dishTypes,
      };

      res.json(mealDetails);
    } catch (error) {
      console.error("💥 Error fetching meal details:", {
        id: req.params.id,
        error: error.message,
        response: error.response?.data,
      });

      if (error.response?.status === 404) {
        return res.status(404).json({
          error: "Meal not found",
          message: "The requested recipe ID does not exist",
        });
      }

      res.status(500).json({
        error: "Failed to fetch meal details",
        message:
          error.response?.data?.message || "An unexpected error occurred",
      });
    }
  },
};

module.exports = mealController;
