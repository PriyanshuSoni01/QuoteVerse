import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FaPlus, 
  FaSearch, 
  FaEdit, 
  FaHome, 
  FaUsers, 
  FaComments, 
  FaUser,
  FaSignOutAlt
} from 'react-icons/fa';
import { logout } from '../../../slices/LoginSlice.js';
import { clearUser } from '../../../slices/AuthSlice.js';

const LeftNavigation = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, currentUser } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.chat);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearUser());
  };

  // Main navigation items for authenticated users
  const navigationItems = [
    { path: "/feed", icon: <FaHome />, label: "Feed", show: true },
    { path: "/create-post", icon: <FaPlus />, label: "Create Post", show: true },
    { path: "/my-posts", icon: <FaEdit />, label: "My Posts", show: true },
    { 
      path: "/chat", 
      icon: <FaComments />, 
      label: "Messages", 
      show: true,
      badge: unreadCount > 0 ? unreadCount : null
    },
  ];

  // Profile section
  const profileItems = [
    { path: "/profile", icon: <FaUser />, label: "Profile", show: true },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg h-[calc(100vh-64px)] fixed left-0 top-16 z-10 hidden lg:block">
      <div className="h-full flex flex-col">
        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          {/* User Profile Section */}
          {currentUser && (
            <div className="px-4 mb-6">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
            </div>
          )}
          {/* Main Navigation */}
          <div className="px-4 mb-6">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Navigation</h3>
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={location.pathname === item.path ? 'text-blue-600 dark:text-blue-400' : ''}>
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Profile */}
          <div className="px-4 mb-6">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Account</h3>
            <ul className="space-y-1">
              {profileItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className={location.pathname === item.path ? 'text-blue-600 dark:text-blue-400' : ''}>
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Footer */}
        <footer className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <FaSignOutAlt size={16} />
            <span className="font-medium">Sign Out</span>
          </button>
        </footer>
      </div>
    </div>
  );
};

export default LeftNavigation;