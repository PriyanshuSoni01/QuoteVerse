import express from 'express';
import verifyToken from '../middlewares/verifyToken.js';
import {
  sendFriendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  removeFriend,
  searchUsers
} from '../controllers/friends.controller.js';

const router = express.Router();

// All routes are protected
router.use(verifyToken);

// Friend Request Routes
router.post('/request/send', sendFriendRequest);
router.get('/requests/incoming', getIncomingRequests);
router.get('/requests/outgoing', getOutgoingRequests);
router.put('/request/:requestId/accept', acceptFriendRequest);
router.put('/request/:requestId/reject', rejectFriendRequest);

// Friends Management Routes
router.get('/list', getFriends);
router.delete('/:friendId', removeFriend);

// User Discovery
router.get('/search', searchUsers);

export default router;