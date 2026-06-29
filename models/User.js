const mongoose = require("mongoose");

/** @type {import("mongoose").Schema} */
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

/** @type {import("mongoose").Model} */
module.exports = mongoose.model("User", userSchema);
