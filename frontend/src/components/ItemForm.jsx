import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const ItemForm = ({ items, setItems, editingItem, setEditingItem }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'lost',
    category: '',
    location: '',
    dateLostFound: '',
    color: '',
    brand: ''
  });

  const categories = [
    'Electronics', 'Clothing', 'Books', 'Keys', 'Jewelry',
    'Bags', 'Documents', 'Sports Equipment', 'Other'
  ];

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title || '',
        description: editingItem.description || '',
        type: editingItem.type || 'lost',
        category: editingItem.category || '',
        location: editingItem.location || '',
        dateLostFound: editingItem.dateLostFound ? 
          new Date(editingItem.dateLostFound).toISOString().split('T')[0] : '',
        color: editingItem.color || '',
        brand: editingItem.brand || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'lost',
        category: '',
        location: '',
        dateLostFound: '',
        color: '',
        brand: ''
      });
    }
  }, [editingItem]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Debug logging
    console.log('User object:', user);
    console.log('User token:', user?.token);
    
    // Check if user is logged in
    if (!user || !user.token) {
      alert('You must be logged in to save items. Please log in again.');
      return;
    }
    
    try {
      if (editingItem) {
        const response = await axiosInstance.put(`/api/items/${editingItem._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        
        setItems(items.map((item) => 
          item._id === response.data._id ? response.data : item
        ));
      } else {
        const response = await axiosInstance.post('/api/items', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        
        setItems([response.data, ...items]);
      }
      
      setEditingItem(null);
      setFormData({
        title: '',
        description: '',
        type: 'lost',
        category: '',
        location: '',
        dateLostFound: '',
        color: '',
        brand: ''
      });
    } catch (error) {
      console.error('Error saving item:', error);
      const errorMessage = error.response?.data?.message || error.message;
      alert(`Failed to save item: ${errorMessage}`);
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      type: 'lost',
      category: '',
      location: '',
      dateLostFound: '',
      color: '',
      brand: ''
    });
  };

  return (
    <div className="bg-white p-6 shadow-lg rounded-lg mb-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {editingItem ? 'Edit Report' : 'Report Lost or Found Item'}
        </h1>
        {editingItem && (
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Item Type */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Item Type *
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="type"
                value="lost"
                checked={formData.type === 'lost'}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-red-600 font-medium">Lost Item</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="type"
                value="found"
                checked={formData.type === 'found'}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-green-600 font-medium">Found Item</span>
            </label>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Item Title *
          </label>
          <input
            type="text"
            name="title"
            placeholder="e.g., iPhone 15, Blue Backpack"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <input
            type="text"
            name="location"
            placeholder="Where was it lost/found? (e.g., Library 2nd floor, Cafeteria near entrance)"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date {formData.type === 'lost' ? 'Lost' : 'Found'} *
          </label>
          <input
            type="date"
            name="dateLostFound"
            value={formData.dateLostFound}
            onChange={handleInputChange}
            max={new Date().toISOString().split('T')[0]}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <input
            type="text"
            name="color"
            placeholder="e.g., Black, Blue, Red"
            value={formData.color}
            onChange={handleInputChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand
          </label>
          <input
            type="text"
            name="brand"
            placeholder="e.g., Apple, Nike, Samsung"
            value={formData.brand}
            onChange={handleInputChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            placeholder="Detailed description of the item..."
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full mt-6 bg-blue-600 text-white p-3 rounded hover:bg-blue-700 font-medium"
      >
        {editingItem ? 'Update Report' : `Report ${formData.type === 'lost' ? 'Lost' : 'Found'} Item`}
      </button>
    </div>
  );
};

export default ItemForm;