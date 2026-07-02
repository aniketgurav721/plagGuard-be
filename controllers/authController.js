const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const log = require("../config/log");

/**
 * Registers a new user with a hashed password.
 * @param {import("express").Request} req - Express request with email and password in body.
 * @param {import("express").Response} res - Express response.
 */
exports.signup = async (req, res) => {
  const { email, password } = req.body;
  log.info("Signup attempt received.", { email });

  if (!email || !password) {
    log.warn("Signup request missing email or password.", { body: req.body });
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    log.info("User created successfully.", { email });
    res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    if (error.code === 11000) {
      log.warn("Signup failed due to duplicate email.", { email });
      return res.status(400).json({ error: "Email already exists." });
    }
    log.error("Error during signup.", { message: error.message, stack: error.stack });
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * Authenticates a user and returns a JWT token.
 * @param {import("express").Request} req - Express request with email and password in body.
 * @param {import("express").Response} res - Express response.
 */
exports.signin = async (req, res) => {
  const { email, password } = req.body;
  log.info("Signin attempt received.", { email });

  if (!email || !password) {
    log.warn("Signin request missing email or password.", { body: req.body });
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      log.warn("Signin failed: user not found.", { email });
      return res.status(400).json({ error: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      log.warn("Signin failed: invalid password.", { email });
      return res.status(400).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    log.info("Signin successful.", { email, userId: user._id.toString() });
    res.status(200).json({ token, email, message: "Login successful." });
  } catch (error) {
    log.error("Error during signin.", { message: error.message, stack: error.stack });
    res.status(500).json({ error: "Internal server error." });
  }
};
