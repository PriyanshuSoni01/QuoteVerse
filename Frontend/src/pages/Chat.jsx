import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { 
  getAllChats, 
  getChatMessages, 
  sendMessage, 
  setActiveChat, 
  clearCurrentChat,
  markAsRead,
  updateConversationsWithNewMessage
} from '../../slices/ChatSlice.js';
import { getFriends } from '../../slices/FriendsSlice.js';
import { FiSend, FiArrowLeft, FiSearch, FiMessageCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useSocket } from '../context/SocketContext.jsx';

const Chat = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { socket } = useSocket();
  
  const {
    conversations,
    conversationsLoading,
    currentChatMessages,
    currentChatLoading,
    activeChat,
    sendLoading
  } = useSelector((state) => state.chat);
  const { friends, friendsLoading } = useSelector((state) => state.friends);
  const { currentUser } = useSelector((state) => state.auth);

  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);

  // Memoize filtered friends to prevent unnecessary re-renders
  const filteredFriends = useMemo(() => {
    return friends.filter(friend =>
      friend.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [friends, searchTerm]);

  // Memoize selected friend to prevent unnecessary re-renders
  const selectedFriend = useMemo(() => {
    return friends.find(friend => friend._id === activeChat);
  }, [friends, activeChat]);

  useEffect(() => {
    dispatch(getAllChats());
    dispatch(getFriends());
    
    // Handle navigation from Discover page - only run once on mount
    if (location.state?.selectedUser) {
      const selectedUser = location.state.selectedUser;
      // Check if this user is in friends list and start chat
      const friend = friends.find(f => f._id === selectedUser._id);
      if (friend) {
        handleSelectFriend(friend);
      }
    }
    
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      // Clear any active chat when component unmounts
      dispatch(clearCurrentChat());
    };
  }, []); // Empty dependency array to prevent infinite calls

  // Listen for new messages via socket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      // If this is a message from someone other than the current user
      if (message.sender._id !== currentUser?._id) {
        // Update conversations with the new message
        dispatch(updateConversationsWithNewMessage(message));
        
        // Show notification if not currently chatting with this person
        if (activeChat !== message.sender._id) {
          toast.info(`New message from ${message.sender.username}`, {
            position: "top-right",
            autoClose: 3000,
          });
        }
        
        // If we're currently viewing this conversation, add the message to the chat
        if (activeChat === message.sender._id) {
          dispatch(addMessageToCurrentChat(message));
        }
      }
    };

    socket.on('newMessageNotification', handleNewMessage);

    return () => {
      socket.off('newMessageNotification', handleNewMessage);
    };
  }, [socket, currentUser, activeChat, dispatch]);

  const handleSelectFriend = useCallback((friend) => {
    dispatch(setActiveChat(friend._id));
    dispatch(getChatMessages({ friendId: friend._id, page: 1 }));
    
    // Mark messages as read when opening the chat
    dispatch(markAsRead(friend._id));
  }, [dispatch]);

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      await dispatch(sendMessage({
        receiverId: activeChat,
        content: newMessage.trim()
      })).unwrap();
      
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  }, [newMessage, activeChat, dispatch]);

  const handleBackToList = useCallback(() => {
    dispatch(clearCurrentChat());
    setIsMobileView(false);
  }, [dispatch]);

  const formatTime = (dateString) => {
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
    if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
    return date.toLocaleDateString();
  };

  const formatMessageTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm h-[calc(100vh-8rem)]">
          <div className="flex h-full">
            {/* Friends List - Left Side */}
            <div className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col ${
              isMobileView && activeChat ? 'hidden' : ''
            }`}>
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Friends</h2>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search friends..."
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Friends List */}
              <div className="flex-1 overflow-y-auto">
                {friendsLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : filteredFriends.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <FiMessageCircle className="w-12 h-12 mb-4 text-gray-300" />
                    <p className="text-center">
                      {searchTerm ? 'No friends found' : 'No friends yet'}
                    </p>
                    <p className="text-sm text-center mt-1">
                      {!searchTerm && 'Add friends to start chatting!'}
                    </p>
                  </div>
                ) : (
                  filteredFriends.map((friend) => {
                    const conversation = conversations.find(conv => conv.otherUser._id === friend._id);
                    const hasUnreadMessages = conversation && conversation.unreadCount > 0;
                    
                    return (
                      <div
                        key={friend._id}
                        onClick={() => handleSelectFriend(friend)}
                        className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                          activeChat === friend._id ? 'bg-blue-50 border-blue-200' : ''
                        } ${hasUnreadMessages ? 'bg-blue-50/50' : ''}`}
                      >
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {friend.username.charAt(0).toUpperCase()}
                          </div>
                          {/* Unread message indicator dot */}
                          {hasUnreadMessages && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className={`font-semibold truncate ${
                              hasUnreadMessages ? 'text-blue-700' : 'text-gray-900'
                            }`}>
                              {friend.username}
                            </h3>
                            {conversation && (
                              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                {formatTime(conversation.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          {conversation ? (
                            <p className={`text-sm truncate ${
                              hasUnreadMessages ? 'text-blue-600 font-medium' : 'text-gray-600'
                            }`}>
                              {conversation.lastMessage.sender._id === currentUser?._id ? 'You: ' : ''}
                              {conversation.lastMessage.content}
                            </p>
                          ) : null}
                        </div>
                        
                        {/* Notification indicators */}
                        <div className="flex items-center space-x-2 ml-2">
                          {/* Unread count from conversation */}
                          {hasUnreadMessages && (
                            <div className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Area - Right Side */}
            <div className={`flex-1 flex flex-col ${
              isMobileView && !activeChat ? 'hidden' : ''
            }`}>
              {activeChat ? (
                <>
                  {/* Chat Header */}
                  <div className="bg-white border-b border-gray-200 p-4 flex items-center">
                    {isMobileView && (
                      <button
                        onClick={handleBackToList}
                        className="mr-3 p-2 hover:bg-gray-100 rounded-full"
                      >
                        <FiArrowLeft className="w-5 h-5" />
                      </button>
                    )}
                    {selectedFriend && (
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {selectedFriend.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <h3 className="font-semibold text-gray-900">
                            {selectedFriend.username}
                          </h3>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {currentChatLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : currentChatMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <FiMessageCircle className="w-12 h-12 mb-4 text-gray-300" />
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation!</p>
                      </div>
                    ) : (
                      currentChatMessages.map((message) => (
                        <div
                          key={message._id}
                          className={`flex ${message.sender._id === currentUser?._id ? 'justify-end' : 'justify-start'}`}
                        >
                          {/* Avatar for received messages */}
                          {message.sender._id !== currentUser?._id && (
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs mr-2 flex-shrink-0 mt-1">
                              {message.sender.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          
                          <div className="max-w-xs lg:max-w-md">
                            {/* Sender name for received messages */}
                            {message.sender._id !== currentUser?._id && (
                              <p className="text-xs text-gray-600 mb-1 ml-1">
                                {message.sender.username}
                              </p>
                            )}
                            
                            <div
                              className={`px-4 py-2 rounded-lg ${
                                message.sender._id === currentUser?._id
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-900 border border-gray-200'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.sender._id === currentUser?._id 
                                  ? 'text-blue-100' 
                                  : 'text-gray-500'
                              }`}>
                                {formatMessageTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                          
                          {/* Avatar for sent messages */}
                          {message.sender._id === currentUser?._id && (
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs ml-2 flex-shrink-0 mt-1">
                              {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="bg-white border-t border-gray-200 p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={sendLoading}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sendLoading}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <FiSend className="w-5 h-5" />
                        )}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                /* No Chat Selected */
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <FiMessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Select a friend to chat
                    </h3>
                    <p className="text-gray-600">
                      Choose a friend from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;