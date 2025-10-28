import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { FiMenu, FiX, FiHome, FiUsers, FiSearch, FiPlus, FiUser, FiMessageCircle, FiUserPlus, FiEdit } from "react-icons/fi";
import { logout } from "../../../slices/LoginSlice.js";
import { clearUser } from "../../../slices/AuthSlice.js";

const Navbar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, currentUser } = useSelector((state) => state.auth);
  const { incomingRequests } = useSelector((state) => state.friends);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearUser());
    setMobileMenuOpen(false);
  };

  const mobileNavItems = [
    { path: "/feed", icon: <FiHome />, label: "Feed" },
    { path: "/create-post", icon: <FiPlus />, label: "Create Post" },
    { path: "/my-posts", icon: <FiEdit />, label: "My Posts" },
    { path: "/friends", icon: <FiUserPlus />, label: "Requests" },
    { path: "/chat", icon: <FiMessageCircle />, label: "Messages" },
    { path: "/discover", icon: <FiSearch />, label: "Discover" },
    { path: "/profile", icon: <FiUser />, label: "Profile" },
  ];

  return (
    <>
      <nav className="bg-gray-800 text-white shadow-lg fixed top-0 left-0 right-0 z-30">
        <div className="w-full px-6">
          <div className="flex justify-between items-center h-16">
            {/* Mobile menu button */}
            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-white hover:bg-gray-700 transition-colors"
              >
                {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            )}
            
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold hover:text-gray-300">
                <h1 style={{
                  fontFamily: 'Lobster, cursive',
                  fontSize: '2rem',
                  color: 'white',
                  textShadow: '2px 2px 5px rgba(0,0,0,0.3)',
                  letterSpacing: '1px'
                }}>
                  QuoteVerse
                </h1>
              </Link>
            </div>
            
            {/* Center Navigation - Requests and Discover */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-4">
                <Link 
                  to="/friends" 
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors relative ${
                    location.pathname === '/friends' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <FiUserPlus className="w-4 h-4" />
                  Requests
                  {incomingRequests && incomingRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {incomingRequests.length > 9 ? '9+' : incomingRequests.length}
                    </span>
                  )}
                </Link>
                
                <Link 
                  to="/discover" 
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === '/discover' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <FiSearch className="w-4 h-4" />
                  Discover
                </Link>
              </div>
            )}
            
            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <span className="text-md font-semibold">
                  Welcome, {currentUser?.username || "User"}
                </span>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition-colors">
                    Login
                  </Link>
                  <Link to="/signup" className="px-4 py-2 bg-white text-gray-700 hover:bg-gray-300 rounded-md text-sm transition-colors">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed left-0 top-16 w-64 h-[calc(100vh-64px)] bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300">
            <div className="p-4">
              {/* User info */}
              {currentUser && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {currentUser.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {currentUser.username || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Navigation items */}
              <nav className="space-y-2">
                {mobileNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative"
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                    {/* Show friend request count on friends link */}
                    {item.path === "/friends" && incomingRequests && incomingRequests.length > 0 && (
                      <span className="absolute top-1 right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {incomingRequests.length > 9 ? '9+' : incomingRequests.length}
                      </span>
                    )}
                  </Link>
                ))}
                
                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <FiX />
                  <span className="font-medium">Sign Out</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;