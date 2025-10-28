import { toast } from 'react-toastify';

/**
 * Follow a user
 * @param {string} userIdToFollow - The ID of the user to follow
 * @returns {Promise<boolean>} - Whether the follow action was successful
 */
export const followUser = async (userIdToFollow) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to follow users');
      return false;
    }

    const response = await fetch('http://localhost:3000/api/user/follow', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userIdToFollow })
    });

    const data = await response.json();
    
    if (data.success) {
      toast.success('Followed successfully!');
      // Dispatch a custom event to refresh profile data
      window.dispatchEvent(new Event('profileRefresh'));
      return true;
    } else {
      toast.error(data.message || 'Failed to follow user');
      return false;
    }
  } catch (error) {
    console.error('Error following user:', error);
    toast.error('Failed to follow user');
    return false;
  }
};

/**
 * Unfollow a user
 * @param {string} userIdToUnfollow - The ID of the user to unfollow
 * @returns {Promise<boolean>} - Whether the unfollow action was successful
 */
export const unfollowUser = async (userIdToUnfollow) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to unfollow users');
      return false;
    }

    const response = await fetch('http://localhost:3000/api/user/unfollow', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userIdToUnfollow })
    });

    const data = await response.json();
    
    if (data.success) {
      toast.success('Unfollowed successfully!');
      // Dispatch a custom event to refresh profile data
      window.dispatchEvent(new Event('profileRefresh'));
      return true;
    } else {
      toast.error(data.message || 'Failed to unfollow user');
      return false;
    }
  } catch (error) {
    console.error('Error unfollowing user:', error);
    toast.error('Failed to unfollow user');
    return false;
  }
};

export default { followUser, unfollowUser };