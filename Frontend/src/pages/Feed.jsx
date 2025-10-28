import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFeed, clearFeed } from '../../slices/PostsSlice.js';
import { FiRefreshCw, FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import PostCard from '../components/PostCard.jsx';
import { toast } from 'react-toastify';

const Feed = () => {
  const dispatch = useDispatch();
  const { 
    feed, 
    feedLoading, 
    feedError, 
    feedPagination, 
    hasMoreFeed 
  } = useSelector((state) => state.posts);

  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Load initial feed
    dispatch(getFeed({ page: 1, limit: 10 }));
  }, [dispatch]);

  useEffect(() => {
    if (feedError) {
      toast.error(feedError);
    }
  }, [feedError]);

  const handleRefresh = async () => {
    setRefreshing(true);
    dispatch(clearFeed());
    setPage(1);
    await dispatch(getFeed({ page: 1, limit: 10 }));
    setRefreshing(false);
    toast.success('Feed refreshed!');
  };

  const handleLoadMore = () => {
    if (!feedLoading && hasMoreFeed && feedPagination) {
      const nextPage = feedPagination.currentPage + 1;
      setPage(nextPage);
      dispatch(getFeed({ page: nextPage, limit: 10 }));
    }
  };

  const isEmpty = !feedLoading && feed.length === 0;

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Feed</h1>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing || feedLoading}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link
                to="/create-post"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Create Post
              </Link>
            </div>
          </div>
          
          <p className="text-gray-600">
            Discover inspiring quotes and poems from your community
          </p>
        </div>

        {/* Feed Content */}
        {isEmpty ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiPlus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No posts yet
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to share an inspiring quote or poem with the community!
              </p>
              <Link
                to="/create-post"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Create Your First Post
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Posts */}
            {feed.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}

            {/* Load More Button */}
            {hasMoreFeed && (
              <div className="text-center py-6">
                <button
                  onClick={handleLoadMore}
                  disabled={feedLoading}
                  className="px-6 py-3 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors disabled:opacity-50"
                >
                  {feedLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                      Loading...
                    </div>
                  ) : (
                    'Load More Posts'
                  )}
                </button>
              </div>
            )}

            {/* End of Feed */}
            {!hasMoreFeed && feed.length > 0 && (
              <div className="text-center py-6">
                <p className="text-gray-500">You've reached the end of the feed</p>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {feedLoading && page === 1 && (
          <div className="space-y-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="flex gap-4">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;