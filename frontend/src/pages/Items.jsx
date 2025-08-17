import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import ItemForm from '../components/ItemForm';
import ItemList from '../components/ItemList';
import { useAuth } from '../context/AuthContext';

const Items = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axiosInstance.get('/api/items', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setItems(response.data);
      } catch (error) {
        alert('Failed to fetch items.');
      }
    };

    fetchItems();
  }, [user]);

  return (
    <div className="container mx-auto p-6">
      <ItemForm
        items={items}
        setItems={setItems}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
      />
      <ItemList items={items} setItems={setItems} setEditingItem={setEditingItem} />
    </div>
  );
};

export default Items;
