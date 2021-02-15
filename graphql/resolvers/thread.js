const Post = require("../../models/Post");
const checkAuth = require("../../utel/checkAuth");
const { AuthenticationError, UserInputError } = require("apollo-server");
const Thread = require("../../models/Thread");
const User = require("../../models/User");

module.exports = {
  Query: {
    async getThreads() {
      try {
        const threads = await Thread.find().sort({ createdAt: -1 });
        const threadPosts = [];
        // let posts = [];
        for (let index = 0; index < threads.length; index++) {
          const thread = threads[index];
          const posts = thread.posts;
          const temp = [];
          for (let index = 0; index < posts.length; index++) {
            const element = posts[index];
            try {
              const post = await Post.findById(element.postID);
              if (post) {
                temp.push(post);
              }
            } catch (e) {
              throw new Error("test");
            }
          }
          threadPosts.push({ posts: temp, thread: thread });
        }
        //   console.log(threadPosts);
        return threadPosts;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getThread(_, { threadID }) {
      try {
        const thread = await Thread.findById(threadID);
        if (thread) {
          return thread;
        } else {
          throw new Error("thread not found");
        }
      } catch (e) {
        throw new Error("test");
      }
    },
    async getThreadPosts(_, { threadID }) {
      const thread = await Thread.findById(threadID);
      const posts = thread.posts;
      const threadPosts = [];
      for (let index = 0; index < posts.length; index++) {
        const element = posts[index];
        try {
          const post = await Post.findById(element.postID);
          if (post) {
            threadPosts.push(post);
          }
        } catch (e) {
          throw new Error("test");
        }
      }

      return threadPosts;
    },
  },
  Mutation: {
    async followThread(_, { threadID }, context) {
      const { id } = checkAuth(context);

      const thread = await Thread.findById(threadID);

      if (thread) {
        const user = await User.findById(id);
        // const isFollowed = user.followedThreads.filter(t => t.threadID == threadID).length > 0;
        if (user.followedThreads.find((t) => t.threadID === threadID)) {
          user.followedThreads = user.followedThreads.filter(
            (t) => t.threadID !== threadID
          );
        } else {
          user.followedThreads.push({ threadID });
        }

        await user.save();
        return thread;
      } else throw new UserInputError("Thread not found ");
    },
    async createThread(_, { name }, context) {
      const user = checkAuth(context);
      if (name.trim() == "") {
        throw new Error("Thread's name must not be empty");
      }

      const newThread = new Thread({
        name,
        user: user.id,
        creatorUsername: user.username,
        createdAt: new Date().toISOString(),
        posts: [],
      });

      const thread = await newThread.save();
      const tUser = await User.findById(user.id);
      if (tUser) {
        tUser.followedThreads.push({ threadID: thread._id });
        console.log(tUser);
        await tUser.save();
      }
      context.pubsub.publish("NEW_THREAD", {
        newThread: thread,
      });
      return thread;
    },
    async editThread(_, { name, threadID }, context) {
      const user = checkAuth(context);

      const thread = await Thread.findById(threadID);
      if (thread) {
        if (thread.creatorUsername === user.username) {
          thread.name = name;
          await thread.save();
          return thread;
        } else {
          throw new AuthenticationError("not allowed");
        }
      } else {
        console.log("no thred found");
      }
    },
    async deleteThread(_, { threadID }, context) {
      const user = checkAuth(context);
      //delete posts then remove from followedThreads

      try {
        const thread = await Thread.findById(threadID);
        if (user.username === thread.creatorUsername) {
          const threadPosts = thread.posts;
          for (let index = 0; index < threadPosts.length; index++) {
            const threadPost = threadPosts[index];

            const post = await Post.findById(threadPost.postID);
            if (post) {
              const username = post.username;
              //console.log(post);
              const postUser = await User.findOne({ username });
              // console.log(postUser);
              if (postUser) {
                postUser.posts = postUser.posts.filter(
                  (p) => p.postID !== post._id
                );
                postUser.followedThreads = postUser.followedThreads.filter(
                  (t) => t.threadID !== threadID
                );
                await postUser.save();
                post.delete();
                console.log("deleted from POSTS");
              } else {
                console.log("no User Found");
              }
            } else {
              console.log("no post found");
            }
          }
          const allUsers = await User.find();
          if (allUsers) {
            for (let index = 0; index < allUsers.length; index++) {
              const element = allUsers[index];
              element.followedThreads = element.followedThreads.filter(
                (t) => t.threadID !== threadID
              );
              await element.save();
              // console.log("threaed removed from followers");
            }
          }

          await thread.delete();
          return "Thread Deleted";
        } else {
          throw new AuthenticationError("Not allowed");
        }
      } catch (e) {
        throw new Error(e);
      }
    },
  },
};
