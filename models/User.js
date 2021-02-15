const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name:String,
  username: String,
  password: String,
  email: String,
  token: String,
  createdAt: String,
  posts : [ {
    postID:String
  }],
  followedThreads  : [{
threadID: String,
  }],
  followedUsers  : [{
    userID: String,
      }]
});

module.exports = model("users", userSchema);
