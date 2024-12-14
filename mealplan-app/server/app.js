const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const { connectToDatabase } = require("./db/connection");
const setupSecurity = require("./api/middleware/security");

// import routes
const usersRouter = require("./api/routes/users");
const mealplansRouter = require("./api/routes/mealplans");
const mealsRouter = require("./api/routes/meal");

// load environment variables
dotenv.config();

// Initialize express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173", // Svelte dev server default port
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // 24 hours
};

// Apply CORS middleware first
app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Apply security middleware
setupSecurity(app);

// Parse JSON and URL-encoded bodies BEFORE other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("Environment loaded:", {
  port: process.env.PORT,
  mongoUri: process.env.MONGODB_URI ? "Set" : "Not Set",
  jwtSecret: process.env.JWT_SECRET ? "Set" : "Not Set",
  corsOrigin: corsOptions.origin,
});

// Connect to MongoDB with debug info
connectToDatabase()
  .then(() => {
    console.log("✅ Successfully connected to MongoDB");
    console.log("Database Connection Info:", {
      database: process.env.MONGODB_URI?.split("/").pop(),
      host:
        process.env.MONGODB_URI?.split("@")[1]?.split("/")[0] || "localhost",
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB Connection Error:", {
      message: error.message,
      code: error.code,
      name: error.name,
    });
    process.exit(1);
  });

// Request logging middleware (now after body parsing)
app.use((req, res, next) => {
  console.log(`\n🌐 ${new Date().toISOString()}`);
  console.log(`📡 ${req.method} ${req.url}`);
  console.log("📋 Headers:", {
    "content-type": req.headers["content-type"],
    authorization: req.headers.authorization ? "Present" : "Not Present",
  });
  console.log("📦 Body:", req.body);

  // Log response status
  const originalSend = res.send;
  res.send = function (data) {
    console.log(`📤 Response Status: ${res.statusCode}`);
    return originalSend.call(this, data);
  };

  next();
});

// Route debugging middleware
app.use((req, res, next) => {
  console.log(`\n🛣️  Route matched: ${req.path}`);
  next();
});

// routes with debug info
console.log("🚀 Setting up routes...");

app.use(
  "/api/users", // Updated with /api prefix
  (req, res, next) => {
    console.log("👤 Users route accessed");
    next();
  },
  usersRouter
);

app.use(
  "/api/mealplans", // Updated with /api prefix
  (req, res, next) => {
    console.log("🍽️  Mealplans route accessed");
    next();
  },
  mealplansRouter
);

app.use(
  "/api/meals", // Updated with /api prefix
  (req, res, next) => {
    console.log("🍳 Meals route accessed");
    next();
  },
  mealsRouter
);

// Root route
app.get("/", (req, res) => {
  console.log("📍 Root route accessed");
  res.json({
    message: "Welcome to the Meal Planner API",
    version: "1.0.0",
    endpoints: {
      users: "/api/users",
      mealplans: "/api/mealplans",
      meals: "/api/meals",
    },
  });
});

// 404 Error Handler
app.use((req, res, next) => {
  console.log("⚠️  404 Error:", req.path);
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

// General Error Handler
app.use((error, req, res, next) => {
  console.error("❌ Error occurred:", {
    path: req.path,
    method: req.method,
    errorMessage: error.message,
    errorStack: error.stack,
    status: error.status || 500,
  });

  // Handle CORS errors specifically
  if (error.name === "CORSError") {
    return res.status(403).json({
      error: {
        message: "CORS error: Origin not allowed",
        status: 403,
      },
    });
  }

  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
      status: error.status || 500,
    },
  });
});

const PORT = process.env.PORT || 4000;

// Start server with health check
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server Status:`);
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📡 http://localhost:${PORT}`);
  console.log("\n📍 Available Routes:");
  console.log("   - GET  /");
  console.log("   - POST /api/users/register");
  console.log("   - POST /api/users/login");
  console.log("   - GET  /api/users/:id");
  console.log("   - PUT  /api/users/:id");
  console.log("   - GET  /api/meals/search");
  console.log("   - GET  /api/mealplans");
  console.log("   - POST /api/mealplans");
});

// Handle server shutdown
process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down server...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

module.exports = app;
