import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { searchUsers, sendFriendRequest, clearSearchResults, getFriends, getSuggestedUsers } from '../../slices/FriendsSlice.js';
import { FiSearch, FiUser, FiUserPlus, FiMessageCircle, FiFileText, FiUsers, FiHeart } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Discover = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    searchResults, 
    searchLoading, 
    sendRequestLoading,
    friends,
    suggestedUsers,
    suggestedLoading,
    suggestedError
  } = useSelector((state) => state.friends);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('search');

  useEffect(() => {
    dispatch(getFriends());
    dispatch(getSuggestedUsers({ limit: 12 }));
    
    return () => {
      dispatch(clearSearchResults());
    };
  }, []); // Empty dependency array to prevent infinite calls

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      dispatch(searchUsers(searchQuery.trim()));
    } else {
      toast.error('Please enter at least 2 characters to search');
    }
  }, [searchQuery, dispatch]);

  const handleSendRequest = useCallback(async (userId) => {
    try {
      await dispatch(sendFriendRequest({ receiverId: userId })).unwrap();
      toast.success('Friend request sent successfully!');
    } catch (error) {
      toast.error('Failed to send friend request');
    }
  }, [dispatch]);

  const handleViewProfile = useCallback((user) => {
    setSelectedUser(user);
    setActiveTab('profile');
  }, []);

  const handleMessage = useCallback((user) => {
    navigate('/chat', { state: { selectedUser: user } });
  }, [navigate]);

  const getActionButton = (user) => {
    const isLoading = sendRequestLoading[user._id];
    
    switch (user.relationshipStatus) {
      case 'friends':
        return (
          <div className="flex gap-2">
            <button 
              onClick={() => handleMessage(user)} 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <FiMessageCircle className="w-4 h-4" />
              Message
            </button>
            <button
              onClick={() => handleViewProfile(user)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            >
              View Profile
            </button>
          </div>
        );
      
      case 'request_sent':
        return (
          <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm">
            Request Sent
          </span>
        );
      
      case 'request_received':
        return (
          <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm">
            Request Received
          </span>
        );
      
      default:
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleSendRequest(user._id)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              <FiUserPlus className="w-4 h-4" />
              {isLoading ? 'Sending...' : 'Add Friend'}
            </button>
            <button
              onClick={() => handleViewProfile(user)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            >
              View Profile
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Discover People</h1>
          <p className="text-gray-600">Find and connect with people who share your interests</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('search')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'search'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiSearch className="w-4 h-4" />
                  Search Users
                </div>
              </button>
              
              {selectedUser && (
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FiUser className="w-4 h-4" />
                    {selectedUser.username}'s Profile
                  </div>
                </button>
              )}
            </nav>
          </div>

          <div className="p-6">
            {/* Search Tab */}
            {activeTab === 'search' && (
              <div>
                {/* Search Form */}
                <form onSubmit={handleSearch} className="mb-8">
                  <div className="relative max-w-2xl mx-auto">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by username or email..."
                      className="w-full px-6 py-4 pl-14 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <FiSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                    <button
                      type="submit"
                      disabled={searchLoading || searchQuery.trim().length < 2}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {searchLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        'Search'
                      )}
                    </button>
                  </div>
                </form>

                {/* Search Results */}
                {searchQuery.length >= 2 ? (
                  searchResults.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Search Results ({searchResults.length})
                      </h3>
                      {searchResults.map((user) => (
                        <div key={user._id} className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900">{user.username}</h4>
                              <p className="text-gray-600">{user.email}</p>
                              {user.bio && (
                                <p className="text-gray-500 text-sm mt-1 max-w-md">{user.bio}</p>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            {getActionButton(user)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    searchLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FiSearch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                        <p className="text-gray-600">Try searching with different keywords</p>
                      </div>
                    )
                  )
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">People on QuoteVerse</h3>
                    {suggestedLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : suggestedUsers.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {suggestedUsers.map((user) => (
                          <div key={user._id} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 text-lg">{user.username}</h4>
                                <p className="text-gray-600 text-sm mb-2">{user.email}</p>
                                {user.bio && (
                                  <p className="text-gray-500 text-sm mb-3">{user.bio}</p>
                                )}
                                <div className="flex gap-2">
                                  {getActionButton(user)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No users available</h3>
                        <p className="text-gray-600">Be the first to join this community!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && selectedUser && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-semibold mx-auto mb-4">
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedUser.username}</h2>
                  <p className="text-gray-600 mb-4">{selectedUser.email}</p>
                  {selectedUser.bio && (
                    <p className="text-gray-700 max-w-2xl mx-auto mb-6">{selectedUser.bio}</p>
                  )}
                  
                  <div className="flex justify-center">
                    {getActionButton(selectedUser)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discover;