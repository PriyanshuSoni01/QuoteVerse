import UserModel from "../models/user.model.js";
import MessageModel from "../models/message.model.js";

// Helper function to generate chat ID
const generateChatId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('_');
};

// SEND Message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, messageType = 'text', replyTo } = req.body;
    const senderId = req.user.userId;

    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID and content are required",
      });
    }

    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a message to yourself",
      });
    }

    // Check if receiver exists
    const receiver = await UserModel.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    // Check if they are friends
    const sender = await UserModel.findById(senderId);
    if (!sender.friends.includes(receiverId)) {
      return res.status(403).json({
        success: false,
        message: "You can only send messages to your friends",
      });
    }

    const chatId = generateChatId(senderId, receiverId);

    const message = new MessageModel({
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
      messageType,
      chatId,
      replyTo: replyTo || null
    });

    await message.save();
    await message.populate('sender', 'username profilePicture');
    await message.populate('receiver', 'username profilePicture');

    if (replyTo) {
      await message.populate('replyTo', 'content sender');
    }

    // Emit real-time message via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('sendMessage', {
        ...message.toObject(),
        receiverId
      });
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully!",
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send message: " + error.message,
    });
  }
};

// GET Chat Messages between two users
export const getChatMessages = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    if (!friendId) {
      return res.status(400).json({
        success: false,
        message: "Friend ID is required",
      });
    }

    // Check if they are friends
    const user = await UserModel.findById(userId);
    if (!user.friends.includes(friendId)) {
      return res.status(403).json({
        success: false,
        message: "You can only view messages with your friends",
      });
    }

    const chatId = generateChatId(userId, friendId);

    const messages = await MessageModel.find({ chatId })
      .populate('sender', 'username profilePicture')
      .populate('receiver', 'username profilePicture')
      .populate('replyTo', 'content sender')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalMessages = await MessageModel.countDocuments({ chatId });

    // Mark messages as read
    await MessageModel.updateMany(
      { chatId, receiver: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: "Chat messages fetched successfully!",
      messages: messages.reverse(), // Show oldest first
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasNextPage: page < Math.ceil(totalMessages / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch chat messages: " + error.message,
    });
  }
};

// GET All Chats (conversations list)
export const getAllChats = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all messages where user is sender or receiver
    const messages = await MessageModel.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: "$chatId",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$receiver", userId] }, { $eq: ["$isRead", false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { "lastMessage.createdAt": -1 }
      }
    ]);

    // Populate user details
    const populatedChats = await Promise.all(
      messages.map(async (chat) => {
        const lastMessage = await MessageModel.findById(chat.lastMessage._id)
          .populate('sender', 'username profilePicture')
          .populate('receiver', 'username profilePicture')
          .lean();

        // Determine the other user in the chat
        const otherUserId = lastMessage.sender._id.toString() === userId.toString() 
          ? lastMessage.receiver._id 
          : lastMessage.sender._id;

        const otherUser = await UserModel.findById(otherUserId)
          .select('username profilePicture isOnline lastSeen')
          .lean();

        return {
          chatId: chat._id,
          otherUser,
          lastMessage,
          unreadCount: chat.unreadCount
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Chats fetched successfully!",
      chats: populatedChats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch chats: " + error.message,
    });
  }
};

// MARK Messages as Read
export const markAsRead = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.userId;

    const chatId = generateChatId(userId, friendId);

    const result = await MessageModel.updateMany(
      { chatId, receiver: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as read successfully!",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read: " + error.message,
    });
  }
};

// DELETE Message (only by sender)
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    const message = await MessageModel.findOneAndDelete({
      _id: messageId,
      sender: userId
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found or unauthorized!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Message deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete message: " + error.message,
    });
  }
};

// GET Unread Messages Count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;

    const unreadCount = await MessageModel.countDocuments({
      receiver: userId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      message: "Unread count fetched successfully!",
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread count: " + error.message,
    });
  }
};