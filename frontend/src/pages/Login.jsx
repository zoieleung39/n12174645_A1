import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ studentNumber: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      
      if (typeof onLogin === 'function') {
        onLogin(response.data);
      }
      
      navigate('/items'); 
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message;
      alert(`Login failed: ${errorMessage}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Student Login</h1>
        <div>
          <input
            type="text"
            placeholder="Student Number"
            value={formData.studentNumber}
            onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
            className="w-full mb-4 p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full mb-4 p-2 border rounded"
            required
          />
          <button 
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;