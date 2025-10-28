import express from 'express';
import verifyToken from '../middlewares/verifyToken.js';
import {
  sendMessage,
  getChatMessages,
  getAllChats,
  markAsRead,
  deleteMessage,
  getUnreadCount
} from '../controllers/chat.controller.js';

const router = express.Router();

// All routes are protected
router.use(verifyToken);

// Chat Routes
router.post('/send', sendMessage);
router.get('/messages/:friendId', getChatMessages);
router.get('/conversations', getAllChats);
router.put('/read/:friendId', markAsRead);
router.delete('/message/:messageId', deleteMessage);
router.get('/unread-count', getUnreadCount);

export default router;