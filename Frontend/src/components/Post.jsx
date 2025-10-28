import { FaRegHeart, FaHeart, FaRegComment, FaShare, FaRegThumbsDown, FaThumbsDown, FaUserPlus, FaUserMinus } from "react-icons/fa";
import { useState } from "react";
import { toast } from 'react-toastify';
import { followUser, unfollowUser } from '../utils/followUtils';

const Post = ({ userId }) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false)

  const toggleLike = () => {
    setLiked(!liked);
    if (disliked) setDisliked(false);
  };

  const toggleDislike = () => {
    setDisliked(!disliked);
    if (liked) setLiked(false);
  };

  const handleFollowToggle = async () => {
    try {
      const success = isFollowing 
        ? await unfollowUser(userId)
        : await followUser(userId);
      
      if (success) {
        setIsFollowing(!isFollowing);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      toast.error('Failed to update follow status');
    }
  }

  return (
    <div className="bg-[#1e293b] p-4 rounded-2xl shadow-md space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-blue-300">Priyanshu Soni</h3>
        <button
  onClick={handleFollowToggle}
  className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-600"
>
  {isFollowing ? (
    <>
      <FaUserMinus /> Unfollow
    </>
  ) : (
    <>
      <FaUserPlus /> Follow
    </>
  )}
</button>
      </div>

      {/* Post content */}
      <p className="text-gray-300">
        Just added a new feature in QuoteVerse 🚀 Loving the clean UI and real-time sync!
      </p>

      {/* Action buttons */}
      <div className="flex items-center justify-between text-gray-400 pt-2 border-t border-gray-600">
        <button 
          onClick={toggleLike} 
          className="flex items-center space-x-1 hover:text-red-500"
        >
          {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
          <span>Like</span>
        </button>

        <button 
          onClick={toggleDislike} 
          className="flex items-center space-x-1 hover:text-blue-500"
        >
          {disliked ? <FaThumbsDown className="text-blue-500" /> : <FaRegThumbsDown />}
          <span>Dislike</span>
        </button>

        <button className="flex items-center space-x-1 hover:text-green-400">
          <FaRegComment />
          <span>Comment</span>
        </button>

        <button className="flex items-center space-x-1 hover:text-yellow-400">
          <FaShare />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default Post;