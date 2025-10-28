import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  getFriends, 
  getIncomingRequests, 
  getOutgoingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  searchUsers,
  sendFriendRequest
} from '../../slices/FriendsSlice.js';
import { setActiveChat } from '../../slices/ChatSlice.js';
import { FiSearch, FiUsers, FiUserPlus, FiCheck, FiX, FiMessageCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Friends = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    friends,
    friendsLoading,
    incomingRequests,
    incomingLoading,
    outgoingRequests,
    outgoingLoading,
    searchResults,
    searchLoading,
    sendRequestLoading,
    acceptRejectLoading
  } = useSelector((state) => state.friends);

  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(getFriends());
    dispatch(getIncomingRequests());
    dispatch(getOutgoingRequests());
  }, []); // Empty dependency array to prevent infinite calls

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      dispatch(searchUsers(searchQuery.trim()));
    }
  }, [searchQuery, dispatch]);

  const handleSendRequest = useCallback(async (userId) => {
    console.log('Sending friend request to:', userId); // Debug log
    try {
      const result = await dispatch(sendFriendRequest({ receiverId: userId })).unwrap();
      console.log('Friend request result:', result); // Debug log
      toast.success('Friend request sent!');
    } catch (error) {
      console.error('Send friend request error:', error); // Debug log
      toast.error('Failed to send request: ' + (error.message || error));
    }
  }, [dispatch]);

  const handleAcceptRequest = useCallback(async (requestId) => {
    try {
      await dispatch(acceptFriendRequest(requestId)).unwrap();
      toast.success('Friend request accepted!');
    } catch (error) {
      toast.error('Failed to accept request');
    }
  }, [dispatch]);

  const handleRejectRequest = useCallback(async (requestId) => {
    try {
      await dispatch(rejectFriendRequest(requestId)).unwrap();
      toast.success('Friend request rejected');
    } catch (error) {
      toast.error('Failed to reject request');
    }
  }, [dispatch]);

  const handleMessageFriend = useCallback((friend) => {
    dispatch(setActiveChat(friend._id));
    navigate('/chat');
  }, [dispatch, navigate]);

  const tabs = [
    { id: 'friends', label: 'Friends', count: friends.length },
    { id: 'incoming', label: 'Requests', count: incomingRequests.length },
    { id: 'search', label: 'Discover', count: null }
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Friends & Connections</h1>
          <p className="text-gray-600">Manage your friends and discover new connections</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Friends List */}
            {activeTab === 'friends' && (
              <div>
                {friendsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : friends.length === 0 ? (
                  <div className="text-center py-12">
                    <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No friends yet</h3>
                    <p className="text-gray-600">Start connecting with people by searching for them!</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {friends.map((friend) => (
                      <div key={friend._id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {friend.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{friend.username}</h4>
                            <p className="text-sm text-gray-600">{friend.email}</p>
                          </div>
                        </div>
                        {friend.bio && (
                          <p className="text-sm text-gray-600 mb-3">{friend.bio}</p>
                        )}
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleMessageFriend(friend)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
                          >
                            <FiMessageCircle className="w-4 h-4" />
                            Message
                          </button>
                          <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm transition-colors">
                            Profile
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Incoming Requests */}
            {activeTab === 'incoming' && (
              <div>
                {incomingLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : incomingRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <FiUserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No friend requests</h3>
                    <p className="text-gray-600">You don't have any pending friend requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {incomingRequests.map((request) => (
                      <div key={request._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {request.sender.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{request.sender.username}</h4>
                            <p className="text-sm text-gray-600">{request.sender.email}</p>
                            {request.message && (
                              <p className="text-sm text-gray-500 mt-1 italic">"{request.message}"</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptRequest(request._id)}
                            disabled={acceptRejectLoading[request._id]}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request._id)}
                            disabled={acceptRejectLoading[request._id]}
                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Search Users */}
            {activeTab === 'search' && (
              <div>
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for users by username or email..."
                      className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <button
                      type="submit"
                      disabled={searchLoading || searchQuery.trim().length < 2}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                    >
                      Search
                    </button>
                  </div>
                </form>

                {searchLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <FiSearch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Search for people</h3>
                    <p className="text-gray-600">Enter a username or email to find new friends</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {searchResults.map((user) => (
                      <div key={user._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{user.username}</h4>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            {user.bio && <p className="text-sm text-gray-500 mt-1">{user.bio}</p>}
                          </div>
                        </div>
                        <div>
                          {user.relationshipStatus === 'friends' ? (
                            <span className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm">Friends</span>
                          ) : user.relationshipStatus === 'request_sent' ? (
                            <span className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm">Request Sent</span>
                          ) : user.relationshipStatus === 'request_received' ? (
                            <span className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm">Request Received</span>
                          ) : (
                            <button
                              onClick={() => handleSendRequest(user._id)}
                              disabled={sendRequestLoading[user._id]}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                            >
                              {sendRequestLoading[user._id] ? 'Sending...' : 'Add Friend'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friends;