const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../../config");
const { UserInputError } = require("apollo-server");
const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../utel/validators");
const Post = require("../../models/Post");
const checkAuth = require("../../utel/checkAuth");
const Thread = require("../../models/Thread");

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      posts: user.posts,
      name: user.name,
      followedThreads: user.followedThreads,
      followedUsers: user.followedUsers,
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
}
module.exports = {
  Query: {
    async getUser(_, { userID }) {
      const user = await User.findById(userID);
      return user;
    },
    async getUsers() {
      const users = await User.find().sort({ createdAt: -1 });
      //console.log(users.ma);
      return users;
    },
    async getUserPosts(_, { userID }) {
      const user = await User.findById(userID);

      const posts = user.posts;
      const userPosts = [];
      for (let index = 0; index < posts.length; index++) {
        const element = posts[index];
        try {
          const post = await Post.findById(element.postID);
          if (post) {
            userPosts.push(post);
          }
        } catch (e) {
          throw new Error(e);
        }
      }

      return userPosts;
    },
  },
  Mutation: {
    async editProfile(_, { name, username, email, password }, context) {
      const { id } = checkAuth(context);
      const user = await User.findById(id);

      if (user.username !== username) {
        const posts = await Post.find({ username: user.username });
        const threads = await Thread.find({ creatorUsername: user.username });
        if (posts.length > 0) {
          for (let index = 0; index < posts.length; index++) {
            const element = posts[index];
            element.username = username;
            await element.save();
          }
        }
        if (threads.length > 0) {
          for (let index = 0; index < threads.length; index++) {
            const element = threads[index];
            element.creatorUsername = username;
            await element.save();
          }
        }
      }
      //user.username = username;
      //await user.save();

      const Tuser = await User.findOne({ username });
      if (Tuser && Tuser.id !== id) {
        throw new UserInputError("Username Taken", {
          errors: {
            username: "This username is taken",
          },
        });
      }
      if (password) password = await bcrypt.hash(password, 12);

      user.name = name;
      user.username = username;
      if (password) user.password = password;
      user.email = email;

      const res = await user.save();

      const token = generateToken(res);
      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
    async followUser(_, { userID }, context) {
      const { id } = checkAuth(context);

      const followUser = await User.findById(userID);

      if (followUser) {
        const user = await User.findById(id);
        // const isFollowed = user.followedThreads.filter(t => t.threadID == threadID).length > 0;
        if (user.followedUsers.find((t) => t.userID === userID)) {
          user.followedUsers = user.followedUsers.filter(
            (t) => t.userID !== userID
          );
        } else {
          user.followedUsers.push({ userID });
        }

        await user.save();
        return followUser;
      } else throw new UserInputError("User not found ");
    },
    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password);
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      const user = await User.findOne({ username });

      if (!user) {
        errors.general = "User not found";
        throw new UserInputError("User not found", { errors });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = "Wrong credentials";
        throw new UserInputError("Wrong credentials", { errors });
      }

      const token = generateToken(user);

      return {
        ...user._doc,
        followedThreads: user.followedThreads,
        followedUsers: user.followedUsers,
        id: user._id,
        token,
      };
    },
    async register(
      _,
      { registerInput: { name, username, email, password, confirmedPassword } }
    ) {
      const { errors, valid } = validateRegisterInput(
        name,
        username,
        email,
        password,
        confirmedPassword
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      const user = await User.findOne({ username });
      if (user) {
        throw new UserInputError("Username Taken", {
          errors: {
            username: "This username is taken",
          },
        });
      }
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        name,
        email,
        username,
        password,
        createdAt: new Date().toISOString(),
        posts: [],
        followedThreads: [],
        followedUsers: [],
      });

      const res = await newUser.save();

      const token = generateToken(res);
      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
  },
};
