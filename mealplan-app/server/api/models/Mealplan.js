const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MealSchema = new Schema({
  recipeId: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  diets: [
    {
      type: String,
    },
  ],
  image: {
    type: String,
    required: true,
  },
});

const MealPlanSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    auto: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  week: {
    type: Number,
    required: true,
    min: 1,
  },
  meals: {
    type: [MealSchema],
    validate: [
      {
        validator: function (meals) {
          return meals.length <= 3;
        },
        message: "Meal plan can only contain a maximum of 3 meals",
      },
    ],
  },
});

// validation hook
MealPlanSchema.pre("save", async function (next) {
  if (this.meals.length > 3) {
    throw new Error("Meal plan cannot contain more than 3 meals");
  }
  next();
});

//  cleanup hook
MealPlanSchema.pre("remove", async function (next) {
  // TODO: add cleanup logic -- logging or cleaning up related data
  console.log(`Removing meal plan ${this._id}`);
  next();
});

const MealPlan = mongoose.model("MealPlan", MealPlanSchema);
module.exports = MealPlan;
