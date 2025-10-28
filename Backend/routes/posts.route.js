import express from 'express';
import verifyToken from '../middlewares/verifyToken.js';
import {
  createPost,
  getFeed,
  getUserPosts,
  toggleLike,
  addComment,
  getPostById,
  updatePost,
  deletePost
} from '../controllers/posts.controller.js';

const router = express.Router();

// All routes are protected
router.use(verifyToken);

// POST Routes
router.post('/create', createPost);
router.get('/feed', getFeed);
router.get('/user-posts', getUserPosts);
router.get('/:postId', getPostById);
router.post('/:postId/like', toggleLike);
router.post('/:postId/comment', addComment);
router.put('/:postId', updatePost);
router.delete('/:postId', deletePost);

export default router;