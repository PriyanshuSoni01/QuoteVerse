import UserModel from "../models/user.model.js";
import FriendRequestModel from "../models/friendRequest.model.js";
import mongoose from "mongoose";

// SEND Friend Request
export const sendFriendRequest = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user.userId;

    console.log('Send friend request:', { senderId, receiverId, message }); // Debug log

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required",
      });
    }

    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a friend request to yourself",
      });
    }

    // Check if receiver exists
    const receiver = await UserModel.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if they are already friends
    const sender = await UserModel.findById(senderId);
    if (sender.friends.includes(receiverId)) {
      return res.status(400).json({
        success: false,
        message: "You are already friends with this user",
      });
    }

    // Check if request already exists
    const existingRequest = await FriendRequestModel.findOne({
      $or: [
        { sender: new mongoose.Types.ObjectId(senderId), receiver: new mongoose.Types.ObjectId(receiverId) },
        { sender: new mongoose.Types.ObjectId(receiverId), receiver: new mongoose.Types.ObjectId(senderId) }
      ]
    });

    console.log('Existing request check:', existingRequest); // Debug log

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Friend request already exists between you two",
      });
    }

    // Create friend request
    const friendRequest = new FriendRequestModel({
      sender: new mongoose.Types.ObjectId(senderId),
      receiver: new mongoose.Types.ObjectId(receiverId),
      message: message || ""
    });

    await friendRequest.save();
    await friendRequest.populate('sender', 'username profilePicture');

    console.log('Friend request saved:', friendRequest); // Debug log

    res.status(201).json({
      success: true,
      message: "Friend request sent successfully!",
      friendRequest
    });
  } catch (error) {
    console.error('Send friend request error:', error); // Debug log
    res.status(500).json({
      success: false,
      message: "Failed to send friend request: " + error.message,
    });
  }
};

// GET Incoming Friend Requests
export const getIncomingRequests = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    console.log('Get incoming requests for userId:', userId); // Debug log

    const requests = await FriendRequestModel.find({
      receiver: new mongoose.Types.ObjectId(userId),
      status: 'pending'
    })
      .populate('sender', 'username email bio profilePicture')
      .sort({ createdAt: -1 });

    console.log('Found incoming requests:', requests.length); // Debug log

    res.status(200).json({
      success: true,
      message: "Incoming friend requests fetched successfully!",
      requests
    });
  } catch (error) {
    console.error('Get incoming requests error:', error); // Debug log
    res.status(500).json({
      success: false,
      message: "Failed to fetch incoming requests: " + error.message,
    });
  }
};

// GET Outgoing Friend Requests
export const getOutgoingRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    const requests = await FriendRequestModel.find({
      sender: userId,
      status: 'pending'
    })
      .populate('receiver', 'username email bio profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Outgoing friend requests fetched successfully!",
      requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch outgoing requests: " + error.message,
    });
  }
};

// ACCEPT Friend Request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.userId;

    const friendRequest = await FriendRequestModel.findOne({
      _id: requestId,
      receiver: userId,
      status: 'pending'
    });

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found or already processed",
      });
    }

    // Update request status
    friendRequest.status = 'accepted';
    await friendRequest.save();

    // Add each other as friends
    await UserModel.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: userId },
      $inc: { friendsCount: 1 }
    });

    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: { friends: friendRequest.sender },
      $inc: { friendsCount: 1 }
    });

    await friendRequest.populate('sender', 'username profilePicture');

    res.status(200).json({
      success: true,
      message: "Friend request accepted successfully!",
      friendRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to accept friend request: " + error.message,
    });
  }
};

// REJECT Friend Request
export const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.userId;

    const friendRequest = await FriendRequestModel.findOne({
      _id: requestId,
      receiver: userId,
      status: 'pending'
    });

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found or already processed",
      });
    }

    // Update request status
    friendRequest.status = 'rejected';
    await friendRequest.save();

    res.status(200).json({
      success: true,
      message: "Friend request rejected successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reject friend request: " + error.message,
    });
  }
};

// GET Friends List
export const getFriends = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await UserModel.findById(userId)
      .populate('friends', 'username email bio profilePicture isOnline lastSeen')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Friends list fetched successfully!",
      friends: user.friends,
      friendsCount: user.friendsCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch friends: " + error.message,
    });
  }
};

// REMOVE Friend
export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.userId;

    if (userId === friendId) {
      return res.status(400).json({
        success: false,
        message: "You cannot remove yourself as a friend",
      });
    }

    // Check if they are actually friends
    const user = await UserModel.findById(userId);
    if (!user.friends.includes(friendId)) {
      return res.status(400).json({
        success: false,
        message: "You are not friends with this user",
      });
    }

    // Remove from both users' friends lists
    await UserModel.findByIdAndUpdate(userId, {
      $pull: { friends: friendId },
      $inc: { friendsCount: -1 }
    });

    await UserModel.findByIdAndUpdate(friendId, {
      $pull: { friends: userId },
      $inc: { friendsCount: -1 }
    });

    res.status(200).json({
      success: true,
      message: "Friend removed successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove friend: " + error.message,
    });
  }
};

// SEARCH Users (to find potential friends)
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.userId;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters long",
      });
    }

    const users = await UserModel.find({
      _id: { $ne: userId }, // Exclude current user
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
      .select('username email bio profilePicture friendsCount postsCount')
      .limit(20)
      .lean();

    // Get current user's friends and pending requests
    const currentUser = await UserModel.findById(userId).select('friends');
    const pendingRequests = await FriendRequestModel.find({
      $or: [
        { sender: userId, status: 'pending' },
        { receiver: userId, status: 'pending' }
      ]
    }).select('sender receiver');

    // Add relationship status to each user
    const usersWithStatus = users.map(user => {
      let relationshipStatus = 'none';
      
      if (currentUser.friends.includes(user._id)) {
        relationshipStatus = 'friends';
      } else {
        const pendingRequest = pendingRequests.find(req => 
          (req.sender.toString() === userId && req.receiver.toString() === user._id.toString()) ||
          (req.receiver.toString() === userId && req.sender.toString() === user._id.toString())
        );
        
        if (pendingRequest) {
          if (pendingRequest.sender.toString() === userId) {
            relationshipStatus = 'request_sent';
          } else {
            relationshipStatus = 'request_received';
          }
        }
      }

      return {
        ...user,
        relationshipStatus
      };
    });

    res.status(200).json({
      success: true,
      message: "Users found successfully!",
      users: usersWithStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to search users: " + error.message,
    });
  }
};