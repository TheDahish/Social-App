const { Schema, model } = require("mongoose");

const postSchema = new Schema({
  id: String,
  username: String,
  createdAt: String,
  body: String,
  threadName:String,
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
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
});

module.exports = model("Post", postSchema);
