const { model } = require("mongoose");
const postsResolvers = require("./post");
const threadResolvers = require("./thread");
const userResolvers = require("./user");
const commentsResolvers = require("./comments");

module.exports = {
  Post: {
    likeCount(parent) {
      return parent.likes.length;
    },
    commentCount(parent) {
      return parent.comments.length;
    },
  },
  Query: {
    ...postsResolvers.Query,
    ...threadResolvers.Query,
    ...userResolvers.Query
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postsResolvers.Mutation,
    ...commentsResolvers.Mutation,
    ...threadResolvers.Mutation
  },
  Subscription: {
    ...postsResolvers.Subscription,
  },
};
