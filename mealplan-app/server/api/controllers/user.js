const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const userController = {
  // Register user
  register: async (req, res) => {
    try {
      const { username, password, preferences } = req.body;

      // Validate required fields
      if (!username || !password) {
        return res.status(400).json({
          error: "Missing required fields",
          details: "Username and password are required",
        });
      }

      const User = mongoose.model("User");

      // Check if user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          error: "Username already exists",
          details: "Please choose a different username",
        });
      }

      // Validate preferences if provided
      const validPreferences = ["ketogenic", "vegetarian", "gluten-free"];
      if (
        preferences &&
        !preferences.every((pref) => validPreferences.includes(pref))
      ) {
        return res.status(400).json({
          error: "Invalid preferences",
          details: "Preferences must be one of: " + validPreferences.join(", "),
        });
      }

      // Create new user
      const user = new User({
        username,
        password, // Will be hashed in pre-save hook
        preferences: preferences || [],
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      // Return user without password
      const userObject = user.toObject();
      delete userObject.password;

      res.status(201).json({
        message: "User registered successfully",
        user: userObject,
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        error: "Error registering user",
        details: error.message,
      });
    }
  },

  // User login
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      // Validate required fields
      if (!username || !password) {
        return res.status(400).json({
          error: "Missing required fields",
          details: "Username and password are required",
        });
      }

      const User = mongoose.model("User");

      // Find user by username
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({
          error: "Invalid credentials",
          details: "Username or password is incorrect",
        });
      }

      // Compare password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: "Invalid credentials",
          details: "Username or password is incorrect",
        });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      res.json({
        message: "Login successful",
        token,
        user: {
          _id: user._id,
          username: user.username,
          preferences: user.preferences,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        error: "Error during login",
        details: error.message,
      });
    }
  },

  // Get user info
  getUserInfo: async (req, res) => {
    try {
      const User = mongoose.model("User");

      // Only allow users to access their own information
      if (req.user._id.toString() !== req.params.id) {
        return res.status(403).json({
          error: "Unauthorized access",
          details: "You can only access your own user information",
        });
      }

      const user = await User.findById(req.params.id).select("-password");
      if (!user) {
        return res.status(404).json({
          error: "User not found",
          details: "The requested user does not exist",
        });
      }

      res.json({
        message: "User information retrieved successfully",
        user,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({
        error: "Error fetching user information",
        details: error.message,
      });
    }
  },

  // Update user preferences
  updatePreferences: async (req, res) => {
    try {
      const User = mongoose.model("User");

      // Only allow users to update their own preferences
      if (req.user._id.toString() !== req.params.id) {
        return res.status(403).json({
          error: "Unauthorized access",
          details: "You can only update your own preferences",
        });
      }

      const { preferences } = req.body;

      // Validate preferences
      const validPreferences = ["ketogenic", "vegetarian", "gluten-free"];
      if (
        !preferences ||
        !Array.isArray(preferences) ||
        !preferences.every((pref) => validPreferences.includes(pref))
      ) {
        return res.status(400).json({
          error: "Invalid preferences",
          details:
            "Preferences must be an array containing any of: " +
            validPreferences.join(", "),
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { preferences },
        {
          new: true,
          select: "-password",
          runValidators: true,
        }
      );

      if (!updatedUser) {
        return res.status(404).json({
          error: "User not found",
          details: "The requested user does not exist",
        });
      }

      res.json({
        message: "Preferences updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({
        error: "Error updating user preferences",
        details: error.message,
      });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    try {
      const User = mongoose.model("User");

      // Only allow users to delete their own account
      if (req.user._id.toString() !== req.params.id) {
        return res.status(403).json({
          error: "Unauthorized access",
          details: "You can only delete your own account",
        });
      }

      const deletedUser = await User.findByIdAndDelete(req.params.id);

      if (!deletedUser) {
        return res.status(404).json({
          error: "User not found",
          details: "The requested user does not exist",
        });
      }

      res.json({
        message: "User deleted successfully",
        userId: deletedUser._id,
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({
        error: "Error deleting user",
        details: error.message,
      });
    }
  },
};

module.exports = userController;
