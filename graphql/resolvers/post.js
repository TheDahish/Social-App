const Post = require("../../models/Post");
const checkAuth = require("../../utel/checkAuth");
const { AuthenticationError, UserInputError } = require("apollo-server");
const Thread = require("../../models/Thread");
const User = require("../../models/User");

module.exports = {
  Query: {
    async getFollowedPosts(_, __, context) {
      const { id } = checkAuth(context);
      const user = await User.findById(id);
      //  console.log(user);
      const followedUsers = user.followedUsers;
      const followedThreads = user.followedThreads;
      const posts = [];
      // console.log("````````````````````````````````````````````````",user)
      for (let index = 0; index < followedUsers.length; index++) {
        const followedUser = await User.findById(followedUsers[index].userID);
        // console.log(followedUser);
        const followedUserPosts = followedUser.posts;

        for (let j = 0; j < followedUserPosts.length; j++) {
          const postid = followedUserPosts[j].postID;
          const post = await Post.findById(postid);
          posts.push(post);
        }
      }
      //console.log(followedThreads);
      for (let index = 0; index < followedThreads.length; index++) {
        const followedThread = await Thread.findById(
          followedThreads[index].threadID
        );
        const followedThreadPosts = followedThread.posts;

        for (let j = 0; j < followedThreadPosts.length; j++) {
          const postid = followedThreadPosts[j].postID;
          const post = await Post.findById(postid);
          if (!post) {
            //   console.log(postid);
          }
          posts.push(post);
        }
      }
      for (let index = 0; index < user.posts.length; index++) {
        const element = user.posts[index].postID;
        const post = await Post.findById(element);
        //console.log(",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,", post);
        posts.push(post);
      }
      return posts;
    },
    async getPost(_, { postid }) {
      try {
        const post = await Post.findById(postid);
        if (post) {
          return post;
        } else {
          throw new Error("post not found");
        }
      } catch (e) {
        throw new Error("test");
      }
    },
    async getPosts() {
      try {
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async editPost(_, { body, postID }, context) {
      const post = await Post.findById(postID);
      const user = checkAuth(context);
      if (post) {
        if (user.username === post.username) {
          post.body = body;
          await post.save();
          return post;
        } else {
          throw new AuthenticationError("not allowed");
        }
      } else {
        console.log("no post found");
      }
    },
    async createPost(_, { body }, context) {
      const user = checkAuth(context);
      if (body.trim() == "") {
        throw new Error("Post body must not be empty");
      }
      const newPost = new Post({
        body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
      });

      const post = await newPost.save();
      context.pubsub.publish("NEW_POST", {
        newPost: post,
      });
      return post;
    },
    async createThreadPost(_, { threadID, body }, context) {
      const user = checkAuth(context);
      const { name } = await Thread.findById(threadID);
      if (body.trim() == "") {
        throw new Error("Post body must not be empty");
      }
      const newPost = new Post({
        threadName: name,
        body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
      });

      const post = await newPost.save();
      context.pubsub.publish("NEW_POST", {
        newPost: post,
      });
      const thread = await Thread.findById(threadID);
      thread.posts.push({ postID: post._id });
      await thread.save();
      return post;
    },
    async createUserPost(_, { body }, context) {
      const user = checkAuth(context);
      if (body.trim() == "") {
        throw new Error("Post body must not be empty");
      }
      const newPost = new Post({
        threadName: "",
        body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
      });

      const post = await newPost.save();
      context.pubsub.publish("NEW_POST", {
        newPost: post,
      });
      const userDB = await User.findById(user.id);
      userDB.posts.push({ postID: post._id });
      await userDB.save();
      return post;
    },
    async deletePost(_, { postid }, context) {
      const user = checkAuth(context);
      try {
        const post = await Post.findById(postid);
        if (user.username === post.username || post.threadName !== "") {
          const userDB = await User.findOne({ username: user.username });
          userDB.posts = userDB.posts.filter((p) => p.postID != postid);
          //  console.log(userDB);
          await userDB.save();
          if (post.threadName != "") {
            const thread = await Thread.findOne({
              name: post.threadName,
            });
            //    console.log(thread);
            if (thread) {
              thread.posts = thread.posts.filter((p) => p.postID != postid);
              thread.save();
            }
          }
          await post.delete();

          return "Post Deleted";
        } else {
          throw new AuthenticationError("Not allowed");
        }
      } catch (e) {
        throw new Error(e);
      }
    },
    async likePost(_, { postid }, context) {
      const { username } = checkAuth(context);

      const post = await Post.findById(postid);

      if (post) {
        if (post.likes.find((like) => like.username === username)) {
          //post already liked
          post.likes = post.likes.filter((like) => like.username !== username);
        } else {
          post.likes.push({ username, createdAt: new Date().toISOString });
        }
        await post.save();
        return post;
      } else throw new UserInputError("Post not found ");
    },
  },
  Subscription: {
    newPost: {
      subscribe: (__, _, { pubsub }) => pubsub.asyncIterator("NEW_POST"),
    },
  },
};
