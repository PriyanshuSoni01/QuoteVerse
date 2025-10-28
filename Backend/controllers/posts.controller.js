import PostModel from "../models/posts.model.js";
import UserModel from "../models/user.model.js";

// CREATE a Post (Protected Route)
export const createPost = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { title, content, type, tags } = req.body;

    // Validate post type
    if (!['quote', 'poem', 'thought'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post type. Must be 'quote', 'poem', or 'thought'",
      });
    }

    const post = new PostModel({
      title,
      content,
      type,
      tags: tags || [],
      author: req.user.userId,
    });

    await post.save();

    // Update user's post count
    await UserModel.findByIdAndUpdate(req.user.userId, {
      $inc: { postsCount: 1 }
    });

    // Populate author details
    await post.populate('author', 'username email');

    res.status(201).json({
      success: true,
      message: "Post created successfully!",
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create post: " + error.message,
    });
  }
};

// GET All Public Posts (Feed)
export const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await PostModel.find({ isPublic: true })
      .populate('author', 'username bio profilePicture')
      .populate('likes.user', 'username') // Add this line to populate likes with user info
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Add isLikedByUser field to each post
    const postsWithLikeStatus = posts.map(post => ({
      ...post,
      isLikedByUser: post.likes?.some(like => like.user?._id.toString() === req.user.userId) || false
    }));

    const totalPosts = await PostModel.countDocuments({ isPublic: true });

    res.status(200).json({
      success: true,
      message: "Feed fetched successfully!",
      posts: postsWithLikeStatus,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        hasNextPage: page < Math.ceil(totalPosts / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch feed: " + error.message,
    });
  }
};

// GET User's Own Posts
export const getUserPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await PostModel.find({ author: req.user.userId })
      .populate('author', 'username bio profilePicture')
      .populate('likes.user', 'username') // Add this line to populate likes with user info
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Add isLikedByUser field to each post
    const postsWithLikeStatus = posts.map(post => ({
      ...post.toObject(),
      isLikedByUser: post.likes?.some(like => like.user?._id.toString() === req.user.userId) || false
    }));

    const totalPosts = await PostModel.countDocuments({ author: req.user.userId });

    res.status(200).json({
      success: true,
      message: "User posts fetched successfully!",
      posts: postsWithLikeStatus,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user posts: " + error.message,
    });
  }
};

// LIKE/UNLIKE a Post
export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found!",
      });
    }

    const existingLike = post.likes.find(like => like.user.toString() === userId);

    if (existingLike) {
      // Unlike the post
      post.likes = post.likes.filter(like => like.user.toString() !== userId);
      post.likesCount = Math.max(0, post.likesCount - 1);
      await post.save();

      res.status(200).json({
        success: true,
        message: "Post unliked successfully!",
        liked: false,
        isLikedByUser: false,
        likesCount: post.likesCount
      });
    } else {
      // Like the post
      post.likes.push({ user: userId });
      post.likesCount += 1;
      await post.save();

      res.status(200).json({
        success: true,
        message: "Post liked successfully!",
        liked: true,
        isLikedByUser: true,
        likesCount: post.likesCount
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle like: " + error.message,
    });
  }
};

// ADD Comment to Post
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found!",
      });
    }

    const comment = {
      user: userId,
      content: content.trim()
    };

    post.comments.push(comment);
    post.commentsCount += 1;
    await post.save();

    // Populate the new comment with user details
    await post.populate('comments.user', 'username profilePicture');

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      message: "Comment added successfully!",
      comment: newComment,
      commentsCount: post.commentsCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add comment: " + error.message,
    });
  }
};

// GET Post by ID with comments
export const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await PostModel.findById(postId)
      .populate('author', 'username bio profilePicture')
      .populate('comments.user', 'username profilePicture')
      .populate('likes.user', 'username');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found!",
      });
    }

    // Add isLikedByUser field to the post
    const postWithLikeStatus = {
      ...post.toObject(),
      isLikedByUser: post.likes?.some(like => like.user?._id.toString() === req.user.userId) || false
    };

    res.status(200).json({
      success: true,
      message: "Post fetched successfully!",
      post: postWithLikeStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch post: " + error.message,
    });
  }
};

// UPDATE Post (Only by author)
export const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content, type, tags } = req.body;
    const userId = req.user.userId;

    // Validate post type
    if (type && !['quote', 'poem', 'thought'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post type. Must be 'quote', 'poem', or 'thought'",
      });
    }

    // Find and update the post (only if user is the author)
    const post = await PostModel.findOneAndUpdate(
      { _id: postId, author: userId },
      {
        title,
        content,
        type,
        tags: tags || [],
        updatedAt: new Date()
      },
      { new: true }
    ).populate('author', 'username email');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found or unauthorized!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Post updated successfully!",
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update post: " + error.message,
    });
  }
};

// DELETE Post (Only by author)
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const post = await PostModel.findOneAndDelete({
      _id: postId,
      author: userId
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found or unauthorized!",
      });
    }

    // Update user's post count
    await UserModel.findByIdAndUpdate(userId, {
      $inc: { postsCount: -1 }
    });

    res.status(200).json({
      success: true,
      message: "Post deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete post: " + error.message,
    });
  }
};