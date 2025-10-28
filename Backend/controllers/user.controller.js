import User from '../models/user.model.js'
import bcryptjs from 'bcryptjs'
// import errorHandler from '../utils/error.js'
import jwt from 'jsonwebtoken'
import crypto from 'crypto';
import { otpEmailTemplate } from '../utils/EmailTemplate.js';
import { transporter } from '../utils/Mailer.js';
import dotenv from "dotenv"
dotenv.config();

export const signup = async (req, res, next) => {
    const { username, email, password } = req.body;
    const existingCount = await User.countDocuments({ email });

    // Limit: only allow up to 3 accounts per email
    if (existingCount >= 2) {
        return res.status(400).json({
            success: false,
            message: 'Email has reached the account creation limit (3 max)',
        });
    }

    const hashedPassword = bcryptjs.hashSync(password, 10)
    const newUser = new User({ username, email, password: hashedPassword })
    try {
        await newUser.save()
        return res.status(201).json({
            success: true,
            message: "user created successfully!"
        })
    } catch (err) {
        next(err);
    }
}

export const signin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const validUser = await User.findOne({ email });
        if (!validUser) {
            return res.status(404).json({
                success: false,
                message: "User not found!"
            });
        }

        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: "Wrong credentials!"
            });
        }

        // Use consistent payload naming (userId instead of id)
        const token = jwt.sign(
            { userId: validUser._id },  // Changed from 'id' to 'userId'
            process.env.JWT_SECRET,
            { expiresIn: '48h' }
        );

        // Return token in response (for header-based auth)
        res.status(200).json({
            success: true,
            message: "Logged In Successfully",
            token,
            user: {
                id: validUser._id,
                username: validUser.username,
                email: validUser.email
            }

        });

    } catch (error) {
        next(error);
    }
};


export const signOut = async (req, res, next) => {
    try {
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        next(error)
    }
}

export const sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    console.log("Step 1");
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    const otp = crypto.randomInt(100000, 999999).toString();
  
    console.log("Step 2");

    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    console.log("Step 3");
    // console.log(process.env.EMAIL_USER)
    // console.log("Pass:", process.env.EMAIL_PASS);

    // Send email using nodemailer
    await transporter.sendMail({
      from: `"QuoteVerse Auth" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Your OTP for Verification 🔐',
      html: otpEmailTemplate(otp, user.username),
    });
console.log("Step 4");
    res.status(200).json({
      success: true,
      message: 'OTP sent to your email address.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
  return res.status(404).json({ 
    success: false, 
    message: 'User not found' 
  });
}

// Check OTP existence & expiry
if (!user.otp || !user.otpExpires || Date.now() > user.otpExpires.getTime()) {
  return res.status(400).json({ 
    success: false, 
    message: 'OTP expired or invalid' 
  });
}

// Check OTP match
if (user.otp !== Number(otp)) {  // make sure to compare as Number
  return res.status(401).json({ 
    success: false, 
    message: 'Incorrect OTP' 
  });
}

// ✅ OTP is valid — clear it
user.otp = undefined;
user.otpExpires = undefined;
user.isVerified = true;
await user.save();

return res.status(200).json({ 
  success: true, 
  message: 'OTP verified successfully' 
});
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'OTP verification failed' });
  }
};
// Follow a user
export const followUser = async (req, res) => {
  try {
    // ✅ Get the id from body
    const { userIdToFollow } = req.body; 
    const currentUserId = req.user.userId; // from JWT middleware

    if (!userIdToFollow) {
      return res.status(400).json({
        success: false,
        message: "Target userId is required",
      });
    }

    if (currentUserId === userIdToFollow) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const userToFollow = await User.findById(userIdToFollow);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already following
    if (userToFollow.followers.includes(currentUserId)) {
      return res.status(400).json({
        success: false,
        message: "You are already following this user",
      });
    }

    // Add to both documents
    userToFollow.followers.push(currentUserId);
    currentUser.following.push(userIdToFollow);

    await userToFollow.save();
    await currentUser.save();

    return res.status(200).json({
      success: true,
      message: `You are now following ${userToFollow.username}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to follow user" });
  }
};



// Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const { userIdToUnfollow } = req.body;
    const currentUserId = req.user.userId;

    console.log(userIdToUnfollow)
    console.log(currentUserId)

    if (!userIdToUnfollow) {
      return res.status(400).json({
        success: false,
        message: "Target userId is required",
      });
    }

    if (currentUserId === userIdToUnfollow) {
      return res.status(400).json({
        success: false,
        message: "You cannot unfollow yourself",
      });
    }

    const userToUnfollow = await User.findById(userIdToUnfollow);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if actually following
    if (!userToUnfollow.followers.includes(currentUserId)) {
      return res.status(400).json({
        success: false,
        message: "You are not following this user",
      });
    }

    // Remove from both documents
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== currentUserId.toString()
    );
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userIdToUnfollow.toString()
    );

    await userToUnfollow.save();
    await currentUser.save();

    return res.status(200).json({
      success: true,
      message: `You unfollowed ${userToUnfollow.username}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to unfollow user" });
  }
};


// Get followers of a user
import mongoose from "mongoose";

export const getFollowers = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const user = await User.findById(currentUserId)
      .populate("followers", "username email")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      followers: user.followers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch followers" });
  }
};



// Get following of a user
export const getFollowing = async (req, res) => {
  try {
    const currentUserId = req.user.userId
    const user = await User.findById(currentUserId).populate("following", "username email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      following: user.following,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch following" });
  }
};

// Get suggested users for discovery
export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { limit = 10 } = req.query;

    // Get current user to access their following list
    const currentUser = await User.findById(currentUserId).select('following');
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get users that current user is NOT following and exclude current user
    const suggestedUsers = await User.find({
      _id: { 
        $ne: currentUserId, // Exclude current user
        $nin: currentUser.following // Exclude users already being followed
      }
    })
    .select('username email bio createdAt followers following')
    .limit(parseInt(limit))
    .sort({ createdAt: -1 }) // Sort by newest users first
    .lean();

    // Add counts and relationship status to each user
    const usersWithCounts = suggestedUsers.map(user => ({
      ...user,
      friendsCount: user.followers ? user.followers.length : 0,
      postsCount: 0, // TODO: Add posts count when posts model is integrated
      relationshipStatus: 'none' // Since these are users not being followed
    }));

    return res.status(200).json({
      success: true,
      users: usersWithCounts,
      total: usersWithCounts.length
    });
  } catch (error) {
    console.error('Error getting suggested users:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch suggested users" 
    });
  }
};

// Search users by username or email
export const searchUsers = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { query, limit = 10 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters long",
      });
    }

    // Get current user to check relationships
    const currentUser = await User.findById(currentUserId).select('following');
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Search users by username or email (case insensitive)
    const searchResults = await User.find({
      _id: { $ne: currentUserId }, // Exclude current user
      $or: [
        { username: { $regex: query.trim(), $options: 'i' } },
        { email: { $regex: query.trim(), $options: 'i' } }
      ]
    })
    .select('username email bio createdAt followers following')
    .limit(parseInt(limit))
    .lean();

    // Add relationship status and counts
    const usersWithStatus = searchResults.map(user => {
      let relationshipStatus = 'none';
      
      if (currentUser.following.includes(user._id)) {
        relationshipStatus = 'friends'; // In this context, following means friends
      }

      return {
        ...user,
        friendsCount: user.followers ? user.followers.length : 0,
        postsCount: 0, // TODO: Add posts count when posts model is integrated
        relationshipStatus
      };
    });

    return res.status(200).json({
      success: true,
      users: usersWithStatus,
      total: usersWithStatus.length
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to search users" 
    });
  }
};

// Get complete user profile with all counts
export const getUserProfile = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    // Execute all queries in parallel for better performance
    const [user, postsCount] = await Promise.all([
      User.findById(currentUserId)
        .select('-password -otp -otpExpires')
        .lean(),
      
      import('../models/posts.model.js')
        .then(module => module.default.countDocuments({ author: currentUserId }))
        .catch(() => 0) // Graceful fallback if posts model doesn't exist
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Calculate counts accurately with explicit checks
    const followersCount = Array.isArray(user.followers) ? user.followers.length : 0;
    const followingCount = Array.isArray(user.following) ? user.following.length : 0;

    // Prepare profile data with guaranteed counts
    const profileData = {
      id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio || '',
      profilePicture: user.profilePicture || '',
      createdAt: user.createdAt,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      followersCount: followersCount,
      followingCount: followingCount,
      postsCount: postsCount,
      friendsCount: user.friendsCount || 0
    };

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      profile: profileData
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch user profile" 
    });
  }
};