import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

// Simple hook for profile data - easy to understand
export const useProfileData = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    bio: '',
    friendsCount: 0,
    postsCount: 0,
    createdAt: ''
  });
  const [loading, setLoading] = useState(false);

  // Simple function to get profile data from API
  const fetchProfileData = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in again');
        return;
      }
      
      const response = await fetch('http://localhost:3000/api/user/profile', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success && data.profile) {
        // Set the profile data from API response
        setProfileData({
          username: data.profile.username || '',
          email: data.profile.email || '',
          bio: data.profile.bio || '',
          friendsCount: data.profile.friendsCount || 0,
          postsCount: data.profile.postsCount || 0,
          createdAt: data.profile.createdAt || new Date().toISOString()
        });
      } else {
        toast.error('Failed to load profile data');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Load data when component starts
  useEffect(() => {
    if (currentUser) {
      fetchProfileData();
    }
  }, [currentUser]);

  // Simple refresh function
  const refreshProfile = () => {
    fetchProfileData();
  };

  return {
    profileData,
    loading,
    refreshProfile
  };
};

export default useProfileData;