const { gql } = require("apollo-server");

module.exports = gql`
  type Thread {
    _id: ID!
    name: String!
    creatorUsername: String!
    posts: [ThreadPosts]!
  }
  type ThreadPosts {
    postID: ID!
  }
  type Post {
    _id: ID!
    body: String!
    createdAt: String!
    username: String!
    comments: [Comment]!
    likes: [Like]!
    likeCount: Int!
    commentCount: Int!
    threadName: String!
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
    name: String!
    id: ID!
    email: String!
    token: String!
    username: String!
    createdAt: String!
    posts: [ThreadPosts]!
    followedThreads: [followedT]!
    followedUsers: [followedU]!
  }
  type followedT {
    threadID: ID!
  }
  type followedU {
    userID: ID!
  }
  input RegisterInput {
    name: String!
    username: String!
    password: String!
    confirmedPassword: String!
    email: String!
  }
  type Query {
    getPosts: [Post]
    getThreads: [threadandpost]
    getUsers: [User]
    getPost(postid: ID!): Post
    getThread(threadID: ID!): Thread
    getThreadPosts(threadID: ID!): [Post]
    getUserPosts(userID: ID!): [Post]
    getFollowedPosts: [Post]
    getUser(userID: ID!): User!
  }
  type threadandpost {
    posts: [Post]!
    thread: Thread!
  }
  type Mutation {
    editProfile(
      name: String!
      username: String!
      email: String!
      password: String
    ): User!
    editPost(body: String!, postID: String!): Post
    editThread(name: String!, threadID: String!): Thread!
    followThread(threadID: ID!): Thread!
    followUser(userID: ID!): User!
    createUserPost(body: String!): Post!
    createThreadPost(threadID: ID!, body: String!): Post!
    createThread(name: String!): Thread!
    deleteThread(threadID: ID!): String!
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
