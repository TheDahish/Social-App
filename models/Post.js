const { Schema, model } = require("mongoose");

const postSchema = new Schema({
  id: String,
  username: String,
  createdAt: String,
  body: String,
  comments: [
    {
      body: String,
      createdAt: String,
      username: String,
    },
  ],
  likes: [
    {
      username: String,
      createdAt: String,
    },
  ],
  user: {
    typr: Schema.Types.ObjectId,
  },
});

module.exports = model("Post", postSchema);
