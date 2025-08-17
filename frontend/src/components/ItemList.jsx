import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const ItemList = ({ items, setItems, setEditingItem }) => {
  const { user } = useAuth();

  const handleDelete = async (itemId) => {
    try {
      await axiosInstance.delete(`/api/items/${itemId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setItems(items.filter((item) => item._id !== itemId));
    } catch (error) {
      alert('Failed to delete item.');
    }
  };

  return (
    <div>
      {items.map((item) => (
        <div key={item._id} className="bg-gray-100 p-4 mb-4 rounded shadow">
          <h2 className="font-bold">{item.title}</h2>
          <p>{item.description}</p>
          <p className="text-sm text-gray-500">Deadline: {new Date(item.deadline).toLocaleDateString()}</p>
          <div className="mt-2">
            <button
              onClick={() => setEditingItem(item)}
              className="mr-2 bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(item._id)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ItemList;
