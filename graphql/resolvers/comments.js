const { UserInputError, AuthenticationError } = require("apollo-server");
const Post = require("../../models/Post");
const checkAuth = require("../../utel/checkAuth");

module.exports = {
  Mutation: {
    createComment: async (_, { postid, body }, context) => {
      const { username } = checkAuth(context);

      if (body.trim() === "") {
        throw new UserInputError("Empty Comment", {
          errors: {
            body: "Comment body is empyt",
          },
        });
      }
      const post = await Post.findById(postid);

      if (post) {
        post.comments.unshift({
          body,
          username,
          createdAt: new Date().toISOString(),
        });
        await post.save();
        return post;
      } else {
        throw new UserInputError("Post not found");
      }
    },

    async deleteComment(_, { postid, commentid }, context) {
      const { username } = checkAuth(context);

      const post = await Post.findById(postid);

      if (post) {
        const commentIndex = post.comments.findIndex((c) => c.id === commentid);

        if (post.comments[commentIndex]) {
          post.comments.splice(commentIndex, 1);
          await post.save();

          return post;
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      }
      throw new UserInputError("Post not found");
    },
  },
};
