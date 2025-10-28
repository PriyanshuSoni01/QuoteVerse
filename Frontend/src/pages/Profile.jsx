import { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaEdit, FaUser, FaEnvelope, FaCalendarAlt, FaUsers, FaSync } from 'react-icons/fa';
import { toast } from 'react-toastify';
import useProfileData from '../hooks/useProfileData.js';

const Profile = () => {
  // Get current user from Redux store
  const { currentUser } = useSelector((state) => state.auth);
  
  // Get profile data using our simple hook
  const { profileData, loading, refreshProfile } = useProfileData();
  
  // State for editing profile
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    bio: ''
  });

  // Toggle edit mode on/off
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Fill form with current data when starting to edit
      setEditForm({
        username: profileData.username,
        bio: profileData.bio
      });
    }
  };

  // Handle input changes in edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save profile changes (TODO: connect to API)
  const handleSaveProfile = async () => {
    try {
      // TODO: Add API call to update profile
      // For now, just show success message
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  // Format date to look nice
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show loading spinner if profile is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        {/* Profile Info */}
        <div className="relative px-6 pb-6">
          {/* Profile Picture */}
          <div className="flex justify-center -mt-16 mb-4">
            <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-4xl border-4 border-white shadow-lg">
              {profileData.username.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Edit and Refresh Buttons */}
          <div className="absolute top-4 right-6 flex gap-2">
            {/* Simple refresh button */}
            <button
              onClick={refreshProfile}
              className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              disabled={loading}
              title="Refresh profile data"
            >
              <FaSync size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            {/* Edit button */}
            <button
              onClick={handleEditToggle}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <FaEdit size={16} />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* User Info */}
          <div className="text-center space-y-2">
            {isEditing ? (
              // Edit mode - show input fields
              <div className="space-y-4">
                <input
                  type="text"
                  name="username"
                  value={editForm.username}
                  onChange={handleInputChange}
                  className="text-2xl font-bold text-center bg-gray-50 dark:bg-gray-700 border rounded-lg px-4 py-2 w-full max-w-md mx-auto block"
                  placeholder="Username"
                />
                <textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full max-w-2xl mx-auto bg-gray-50 dark:bg-gray-700 border rounded-lg px-4 py-2 resize-none"
                  placeholder="Tell us about yourself..."
                />
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleSaveProfile}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View mode - show profile info
              <>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {profileData.username}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                  <FaEnvelope size={16} />
                  {profileData.email}
                </p>
                {profileData.bio && (
                  <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mt-4">
                    {profileData.bio}
                  </p>
                )}
                <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2 mt-4">
                  <FaCalendarAlt size={16} />
                  Joined {formatDate(profileData.createdAt)}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards - Simple and clear */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Friends Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <FaUsers className="text-blue-500" size={24} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Friends</h3>
          </div>
          <p className="text-3xl font-bold text-blue-500">{profileData.friendsCount}</p>
        </div>

        {/* Posts Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <FaEdit className="text-green-500" size={24} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Posts</h3>
          </div>
          <p className="text-3xl font-bold text-green-500">{profileData.postsCount}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;