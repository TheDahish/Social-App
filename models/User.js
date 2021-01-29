const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  username: String,
  password: String,
  email: String,
  token: String,
  createdAt: String,
});

module.exports = model("users", userSchema);
