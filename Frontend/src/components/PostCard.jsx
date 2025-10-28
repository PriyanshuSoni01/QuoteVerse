import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleLike, addComment } from '../../slices/PostsSlice.js';
import { FiHeart, FiMessageCircle, FiMoreHorizontal, FiSend } from 'react-icons/fi';
import { toast } from 'react-toastify';

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const { likeLoading, commentLoading } = useSelector((state) => state.posts);
  const { currentUser } = useSelector((state) => state.auth);
  
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(post.isLikedByUser || false);

  // Update isLiked state when post changes
  useEffect(() => {
    setIsLiked(post.isLikedByUser || false);
  }, [post.isLikedByUser]);

  const isLikeLoading = likeLoading[post._id];
  const isCommentLoading = commentLoading[post._id];

  const handleLike = async () => {
    try {
      await dispatch(toggleLike(post._id)).unwrap();
      setIsLiked(!isLiked);
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await dispatch(addComment({ postId: post._id, content: newComment.trim() })).unwrap();
      setNewComment('');
      toast.success('Comment added successfully!');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Reset time part for accurate day comparison
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Calculate difference in days
    const diffTime = today - dateOnly;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getPostTypeColor = (type) => {
    switch (type) {
      case 'quote': return 'bg-blue-100 text-blue-800';
      case 'poem': return 'bg-purple-100 text-purple-800';
      case 'thought': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {post.author?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {post.author?.username || 'Unknown User'}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{formatDate(post.createdAt)}</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPostTypeColor(post.type)}`}>
                  {post.type}
                </span>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FiMoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          {post.title}
        </h2>
        <div className="prose prose-sm max-w-none">
          <p className={`text-gray-700 leading-relaxed ${post.type === 'poem' ? 'whitespace-pre-line' : ''}`}>
            {post.content}
          </p>
        </div>
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              disabled={isLikeLoading}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                isLiked 
                  ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
              } disabled:opacity-50`}
            >
              <FiHeart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{post.likesCount || 0}</span>
              {isLikeLoading && (
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
              )}
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            >
              <FiMessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{post.commentsCount || 0}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100">
          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="p-4 border-b border-gray-100">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isCommentLoading}
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isCommentLoading}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {isCommentLoading ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FiSend className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Comments List */}
          {post.comments && post.comments.length > 0 && (
            <div className="max-h-60 overflow-y-auto">
              {post.comments.slice(0, 5).map((comment) => (
                <div key={comment._id} className="p-4 border-b border-gray-50 last:border-b-0">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">
                          {comment.user?.username || 'Unknown User'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {post.comments.length > 5 && (
                <div className="p-3 text-center">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View all {post.commentsCount} comments
                  </button>
                </div>
              )}
            </div>
          )}

          {/* No Comments State */}
          {(!post.comments || post.comments.length === 0) && (
            <div className="p-6 text-center text-gray-500">
              <FiMessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;