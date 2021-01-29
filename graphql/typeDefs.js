const { gql } = require("apollo-server");

module.exports = gql`
  type Post {
    _id: ID!
    body: String!
    createdAt: String!
    username: String!
    comments: [Comment]!
    likes: [Like]!
    likeCount: Int!
    commentCount: Int!
  }
  type Comment {
    _id: ID!
    createdAt: String!
    username: String!
    body: String!
  }
  type Like {
    _id: ID!
    createdAt: String!
    username: String!
  }
  type User {
    id: ID!
    email: String!
    token: String!
    username: String!
    createdAt: String!
  }
  input RegisterInput {
    username: String!
    password: String!
    confirmedPassword: String!
    email: String!
  }
  type Query {
    getPosts: [Post]
    getPost(postid: ID!): Post
  }
  type Mutation {
    createComment(postid: ID!, body: String!): Post!
    deleteComment(postid: ID!, commentid: ID!): Post!
    likePost(postid: ID!): Post!
    createPost(body: String!): Post!
    deletePost(postid: ID!): String!
    register(registerInput: RegisterInput): User!
    login(username: String!, password: String!): User!
  }
  type Subscription {
    newPost: Post!
  }
`;
