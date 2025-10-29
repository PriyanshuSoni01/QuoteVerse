import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaEdit, FaTrash, FaHeart, FaComment, FaEye, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;
const MyPosts = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Fetch user's posts
  const fetchMyPosts = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please log in to view your posts');
        return;
      }

      const response = await fetch(`${API_BASE}/posts/user-posts?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setPosts(data.posts || []);
        setCurrentPage(data.pagination?.currentPage || 1);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalPosts(data.pagination?.totalPosts || 0);
      } else {
        toast.error('Failed to fetch your posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Error loading your posts');
    } finally {
      setLoading(false);
    }
  };

  // Delete a post
  const deletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(postId);
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Post deleted successfully!');
        // Remove the post from the local state
        setPosts(posts.filter(post => post._id !== postId));
        setTotalPosts(prev => prev - 1);
      } else {
        toast.error(data.message || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Error deleting post');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get post type color
  const getPostTypeColor = (type) => {
    switch (type) {
      case 'quote':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'poem':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'thought':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  useEffect(() => {
    fetchMyPosts(currentPage);
  }, [currentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Posts
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and view all your posts ({totalPosts} total)
        </p>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <FaEdit className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No posts yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start sharing your thoughts, quotes, and poems with the world!
          </p>
          <a
            href="/create-post"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaEdit className="mr-2" />
            Create Your First Post
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
            >
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPostTypeColor(post.type)}`}>
                      {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1">
                      <FaCalendarAlt />
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {post.title}
                  </h3>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/edit-post/${post._id}`)}
                    className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <FaEdit />
                    Edit
                  </button>
                  <button
                    onClick={() => deletePost(post._id)}
                    disabled={deleteLoading === post._id}
                    className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deleteLoading === post._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <FaTrash />
                    )}
                    Delete
                  </button>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>

              {/* Post Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Post Stats */}
              <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400 text-sm">
                <div className="flex items-center gap-1">
                  <FaHeart />
                  <span>{post.likesCount || 0} likes</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaComment />
                  <span>{post.commentsCount || 0} comments</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaEye />
                  <span>Public</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MyPosts;