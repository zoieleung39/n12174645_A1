import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const ItemList = ({ items, setItems, setEditingItem }) => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/items/${itemId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setItems(items.filter((item) => item._id !== itemId));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete item.');
    }
  };

  const handleStatusUpdate = async (itemId, newStatus) => {
    try {
      const response = await axiosInstance.put(`/api/items/${itemId}`, 
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      setItems(items.map(item => 
        item._id === itemId ? response.data : item
      ));
    } catch (error) {
      console.error('Status update error:', error);
      alert('Failed to update status.');
    }
  };

  // Filter items based on type and category
  const filteredItems = items.filter(item => {
    const typeMatch = filter === 'all' || item.type === filter;
    const categoryMatch = categoryFilter === 'all' || item.category === categoryFilter;
    return typeMatch && categoryMatch;
  });

  // Get unique categories for filter dropdown
  const categories = [...new Set(items.map(item => item.category))].filter(Boolean);

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'transferred to campus security office': return 'bg-blue-100 text-blue-800';
      case 'kept by finder': return 'bg-yellow-100 text-yellow-800';
      case 'claimed by owner': return 'bg-purple-100 text-purple-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    if (type === 'lost') return 'text-red-600 font-semibold';
    if (type === 'found') return 'text-green-600 font-semibold';
    return 'text-gray-600 font-semibold'; // Default for undefined/unknown types
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString();
  };

  return (
    <div>
      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Filter Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Type
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Items</option>
              <option value="lost">Lost Items</option>
              <option value="found">Found Items</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Items Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredItems.length} of {items.length} items
        </p>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No items found matching your filters.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item._id} className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-bold text-gray-800">{item.title}</h2>
                  {item.type && (
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getTypeColor(item.type)}`}>
                      {item.type.toUpperCase()}
                    </span>
                  )}
                  {item.category && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {item.category}
                    </span>
                  )}
                  {!item.type && !item.category && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                      Legacy Item
                    </span>
                  )}
                </div>
                {item.status && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                )}
              </div>

              {/* Item Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  {item.location && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Location:</span> {item.location}
                    </p>
                  )}
                  {item.dateLostFound && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Date {item.type === 'lost' ? 'Lost' : item.type === 'found' ? 'Found' : 'Reported'}:</span> {formatDate(item.dateLostFound)}
                    </p>
                  )}
                  {item.deadline && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Deadline:</span> {formatDate(item.deadline)}
                    </p>
                  )}
                  {item.color && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Color:</span> {item.color}
                    </p>
                  )}
                  {item.brand && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Brand:</span> {item.brand}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Reported by:</span> {item.userId?.name || 'Unknown'} 
                    {item.userId?.studentNumber && ` (${item.userId.studentNumber})`}
                  </p>
                  {item.createdAt && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Reported on:</span> {formatDate(item.createdAt)}
                    </p>
                  )}
                  {item.completed !== undefined && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Status:</span> {item.completed ? 'Completed' : 'Active'}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              {item.description && (
                <div className="mb-4">
                  <p className="text-gray-700">
                    <span className="font-medium">Description:</span> {item.description}
                  </p>
                </div>
              )}

              {/* Status Update (only for item owner) */}
              {item.userId?._id === user?.id && item.status === 'open' && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm font-medium text-yellow-800 mb-2">Update item status:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleStatusUpdate(item._id, 'transferred to campus security office')}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      Transferred to Security
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(item._id, 'kept by finder')}
                      className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                    >
                      Kept by Finder
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(item._id, 'claimed by owner')}
                      className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                    >
                      Claimed by Owner
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(item._id, 'closed')}
                      className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                    >
                      Close Report
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons (only for item owner) */}
              {item.userId?._id === user?.id && (
                <div className="flex space-x-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                  >
                    Edit Report
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Delete Report
                  </button>
                </div>
              )}

              {/* Contact Info for others */}
              {item.userId?._id !== user?.id && item.status === 'open' && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Need to contact the reporter?</span> 
                    <br />Contact {item.userId?.name} through campus directory or student services.
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ItemList;