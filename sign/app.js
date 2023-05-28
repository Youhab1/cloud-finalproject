

const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const { body, validationResult } = require("express-validator");
const app = express();
const port = 3000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  homeAddress: {
    type: String,
    required: false,
  },
});

const User = mongoose.model("User", userSchema);

// Validation middleware
const validateSignup = [
  body("username").notEmpty().withMessage("Username is required"),
  body("username").custom(async (value) => {
    const existingUser = await User.findOne({ username: value });
    if (existingUser) {
      throw new Error("Username already taken");
    }
    return true;
  }),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
  body("phoneNumber")
    .optional()
    .isMobilePhone("ar-EG")
    .withMessage("Invalid Egyptian phone number"),
  body("email").isEmail().withMessage("Invalid email address"),
  body("homeAddress").optional(),
];

// Error handling middleware for validation errors
app.use((err, req, res, next) => {
  if (err instanceof validationResult) {
    const errorMessages = err.array().map((error) => error.msg);
    console.error("Validation error:", errorMessages);
    return res.status(400).json({ errors: errorMessages.join("\n") });
  }
  next(err);
});

// Error handling middleware for MongoDB save errors
app.use((err, req, res, next) => {
  console.error("Error saving user to MongoDB:", err);
  res.status(500).json({ error: "Failed to sign up user" });
});

// Sign in route
app.post("/sign/signin", async (req, res) => {
  const { username, password } = req.body;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  try {
    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

   

    res.status(200).json({ message: "User signed in successfully" });
  } catch (error) {
    console.error("Error querying user from MongoDB:", error);
    res.status(500).json({ error: "Failed to sign in user" });
  }
});

// Sign up route
app.post("/sign/signup", validateSignup, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    console.error("Validation error:", errorMessages);
    return res.status(400).json({ errors: errorMessages.join("\n") });
  }

  const { username, password, phoneNumber, email, homeAddress } = req.body;

  try {
    const newUser = new User({
      username,
      password,
      phoneNumber,
      email,
      homeAddress,
    });

    await newUser.save();

    res.status(200).json({ message: "User signed up successfully" });
  } catch (error) {
    console.error("Error saving user to MongoDB:", error);
    res.status(500).json({ error: "Failed to sign up user" });
  }
});

// Database connection
mongoose
  .connect("mongodb://my-mongodb:27017/mydatabase", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });


