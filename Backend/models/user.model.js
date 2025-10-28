import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true, // username should be unique
    },
    email: {
      type: String,
      required: true,
      unique: true, // email should be unique
    },
    password: {
      type: String,
      required: true,
    },
    favourites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note",
      },
    ],
    otp: {
      type: Number,
    },
    otpExpires: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      maxlength: 150,
      default: ""
    },
    profilePicture: {
      type: String,
      default: ""
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    postsCount: {
      type: Number,
      default: 0
    },
    friends: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    friendsCount: {
      type: Number,
      default: 0
    },

    // Followers & Following
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Counts for faster lookup
    followersCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
    timestamps: true, // adds createdAt & updatedAt
  }
);

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
