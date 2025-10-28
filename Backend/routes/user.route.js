import express from "express";
import { signup, signin, sendOtp, verifyOtp, followUser, getFollowers,getFollowing, unfollowUser, getSuggestedUsers, searchUsers, getUserProfile } from "../controllers/user.controller.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/signin", signin);
router.post("/signup",signup)
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/follow',verifyToken, followUser)
router.post("/unfollow", verifyToken, unfollowUser);
router.get("/followers",verifyToken, getFollowers);
router.get("/following", verifyToken, getFollowing);
router.get("/profile", verifyToken, getUserProfile);
router.get("/suggested", verifyToken, getSuggestedUsers);
router.get("/search", verifyToken, searchUsers);

export default router;