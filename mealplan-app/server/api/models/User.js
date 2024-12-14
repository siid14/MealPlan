const crypto = require("crypto");
const util = require("util");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Promisify scrypt
const scryptAsync = util.promisify(crypto.scrypt);

const UserSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    auto: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    set: (v) => v.toLowerCase(),
  },
  password: {
    type: String,
    required: true,
  },
  preferences: [
    {
      type: String,
      enum: ["ketogenic", "vegetarian", "gluten-free"],
    },
  ],
});

// Password hashing hook using scrypt
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      // Generate a random salt
      const salt = crypto.randomBytes(16);

      // Hash password with scrypt
      const derivedKey = await scryptAsync(this.password, salt, 64);

      // Store both salt and hash together, separated by a colon
      this.password = `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Password comparison method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // Split the stored password into salt and hash
    const [storedSalt, storedHash] = this.password.split(":");

    if (!storedSalt || !storedHash) {
      throw new Error("Invalid password format in database");
    }

    // Convert stored values from hex to Buffer
    const salt = Buffer.from(storedSalt, "hex");
    const hash = Buffer.from(storedHash, "hex");

    // Hash the candidate password with the same salt
    const candidateHash = await scryptAsync(candidatePassword, salt, 64);

    // Compare hashes in constant time
    return crypto.timingSafeEqual(hash, candidateHash);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
};

// cleanup hook - prevent circular dependency
UserSchema.pre("remove", async function (next) {
  try {
    // Using this.model() to avoid circular dependency
    const MealPlan = this.model("MealPlan");
    await MealPlan.deleteMany({ userId: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
