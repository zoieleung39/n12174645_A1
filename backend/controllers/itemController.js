const Item = require('../models/Item');

const getItems = async (req, res) => {
    try {
        console.log('=== GET ITEMS DEBUG ===');
        console.log('User:', req.user);
        console.log('Query params:', req.query);
        
        // Show ALL items to everyone (no user filtering)
        const items = await Item.find({});
        console.log('Found items count:', items.length);
        console.log('Items:', items);
        
        const populatedItems = await Item.find({})
            .populate('userId', 'name studentNumber')
            .sort({ createdAt: -1 });
            
        console.log('Populated items:', populatedItems);
        
        res.json(populatedItems);
    } catch (error) {
        console.error('Error in getItems:', error);
        res.status(500).json({ message: error.message });
    }
};

// Add new item
const addItem = async (req, res) => {
    const { 
        title, 
        description, 
        type,
        category,
        location,
        dateLostFound,
        color,
        brand
    } = req.body;

    console.log('=== ADD ITEM DEBUG ===');
    console.log('Request body:', req.body);
    console.log('User object:', req.user);
    console.log('User ID:', req.user?.id);

    try {
        const itemData = {
            userId: req.user.id,
            title,
            description,
            type: type || 'lost',
            category: category || 'Other',
            location: location || '',
            dateLostFound: dateLostFound ? new Date(dateLostFound) : new Date(),
            color,
            brand
        };

        const item = await Item.create(itemData);
        
        // Populate user info before returning
        const populatedItem = await Item.findById(item._id)
            .populate('userId', 'name studentNumber');

        console.log('Successfully created item:', populatedItem);
        res.status(201).json(populatedItem);
    } catch (error) {
        console.error('Error in addItem:', error);
        console.error('Error message:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// Update item 
const updateItem = async (req, res) => {
    try {
        const item = await Item.findOne({ 
            _id: req.params.id, 
            userId: req.user.id 
        });

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Update fields
        const updateFields = [
            'title', 'description', 'type', 'category', 'location', 
            'dateLostFound', 'color', 'brand', 'status'
        ];

        updateFields.forEach(field => {
            if (req.body[field] !== undefined) {
                if (field === 'dateLostFound' && req.body[field]) {
                    item[field] = new Date(req.body[field]);
                } else {
                    item[field] = req.body[field];
                }
            }
        });

        const updatedItem = await item.save();
        
        const populatedItem = await Item.findById(updatedItem._id)
            .populate('userId', 'name studentNumber');

        res.json(populatedItem);
    } catch (error) {
        console.error('Error in updateItem:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete item
const deleteItem = async (req, res) => {
    try {
        const item = await Item.findOneAndDelete({ 
            _id: req.params.id, 
            userId: req.user.id 
        });

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error in deleteItem:', error);
        res.status(500).json({ message: error.message });
    }
};

// Search items
const searchItems = async (req, res) => {
    try {
        const { query, type, category, location } = req.query;
        
        let filter = { status: 'open' };
        
        if (type) filter.type = type;
        if (category) filter.category = category;
        if (location) filter.location = location;
        
        if (query) {
            filter.$or = [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { brand: { $regex: query, $options: 'i' } },
                { color: { $regex: query, $options: 'i' } }
            ];
        }

        const items = await Item.find(filter)
            .populate('userId', 'name studentNumber')
            .sort({ createdAt: -1 })
            .limit(50);
            
        res.json(items);
    } catch (error) {
        console.error('Error in searchItems:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    getItems, 
    addItem, 
    updateItem, 
    deleteItem,
    searchItems
};