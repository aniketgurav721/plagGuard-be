const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Registers a new user with a hashed password.
 * @param {import("express").Request} req - Express request with email and password in body.
 * @param {import("express").Response} res - Express response.
 */
exports.signup = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already exists." });
    }
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

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ token, email, message: "Login successful." });
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};
