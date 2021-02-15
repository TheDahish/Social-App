const { Schema, model } = require("mongoose");

const threadSchema = new Schema({
  creatorUsername: String,
  name: String,
  posts: [{
      postID: String
  }],
  createdAt: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
});

module.exports = model("Thread", threadSchema);
