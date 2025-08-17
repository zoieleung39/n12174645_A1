import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';

const Profile = ({ user }) => {
  const [formData, setFormData] = useState({
    name: '',
    studentNumber: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch profile data from the backend
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        
        setFormData({
          name: response.data.name || '',
          studentNumber: response.data.studentNumber || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
        });
      } catch (error) {
        console.error('Profile fetch error:', error);
        alert('Failed to fetch profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.put('/api/auth/profile', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
        // Note: studentNumber is not included as it cannot be changed
      }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.message || error.message;
      alert(`Failed to update profile: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Your Profile</h1>
        <div>
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full mb-4 p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Student Number"
            value={formData.studentNumber}
            className="w-full mb-4 p-2 border rounded bg-gray-100"
            disabled
            title="Student number cannot be changed"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full mb-4 p-2 border rounded"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full mb-4 p-2 border rounded"
          />
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;