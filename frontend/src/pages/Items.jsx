import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import ItemForm from '../components/ItemForm';
import ItemList from '../components/ItemList';
import { useAuth } from '../context/AuthContext';

const Items = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'mine'

  useEffect(() => {
    const fetchItems = async () => {
      console.log('=== FRONTEND FETCH DEBUG ===');
      console.log('User:', user);
      console.log('User token:', user?.token);
      console.log('View mode:', viewMode);
      
      try {
        const params = viewMode === 'mine' ? { userId: 'mine' } : {};
        console.log('Params being sent:', params);
        
        const response = await axiosInstance.get('/api/items', {
          headers: { Authorization: `Bearer ${user.token}` },
          params
        });
        
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        console.log('Items received:', response.data.length);
        
        setItems(response.data);
      } catch (error) {
        console.error('Fetch error:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        alert('Failed to fetch items.');
      }
    };

    if (user && user.token) {
      fetchItems();
    } else {
      console.log('No user or token, skipping fetch');
    }
  }, [user, viewMode]);

  if (!user) {
    return <div>Please log in to access items.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {/* View Mode Toggle */}
      <div className="mb-6 flex justify-center">
        <div className="bg-white rounded-lg shadow p-1 flex">
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-md transition-colors ${
              viewMode === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setViewMode('mine')}
            className={`px-4 py-2 rounded-md transition-colors ${
              viewMode === 'mine' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            My Items
          </button>
        </div>
      </div>

      <ItemForm
        items={items}
        setItems={setItems}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
      />
      <ItemList 
        items={items} 
        setItems={setItems} 
        setEditingItem={setEditingItem}
      />
    </div>
  );
};

export default Items;