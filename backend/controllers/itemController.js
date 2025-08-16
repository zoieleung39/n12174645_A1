const Task = require('../models/Item');
const getItems = async (
req,
res) => {
try {
const items = await Items.find({ userId: req.user.id });
res.json(items);
} catch (error) {
res.status(500).json({ message: error.message });
}
};

const addItem = async (
req,
res) => {
const { title, description, deadline } = req.body;
try {
const item = await Item.create({ userId: req.user.id, title, description, deadline });
res.status(201).json(item);
} catch (error) {
res.status(500).json({ message: error.message });
}
};

const updateItem = async (
req,
res) => {
const { title, description, completed, deadline } = req.body;
try {
const item = await Item.findById(req.params.id);
if (!item) return res.status(404).json({ message: 'Item not found' });
item.title = title || item.title;
item.description = description || item.description;
item.completed = completed ?? item.completed;
item.deadline = deadline || item.deadline;
const updatedItem = await item.save();
res.json(updatedItem);
} catch (error) {
res.status(500).json({ message: error.message });
}
};

const deleteItem = async (req,res) => {
try {
const item = await Item.findById(req.params.id);
if (!item) return res.status(404).json({ message: 'Item not found' });
await item.remove();
res.json({ message: 'Item deleted' });
} catch (error) {
res.status(500).json({ message: error.message });
}
};
module.exports = { getItems, addItem, updateItem, deleteItem }
