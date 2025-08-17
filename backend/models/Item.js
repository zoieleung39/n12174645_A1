const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    // Basic item information
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    
    // Lost & Found specific fields
    type: {
        type: String,
        enum: ['lost', 'found'],
        required: true
    },
    category: {
        type: String,
        enum: [
            'Electronics',
            'Clothing', 
            'Books',
            'Keys',
            'Jewelry',
            'Bags',
            'Documents',
            'Sports Equipment',
            'Other'
        ],
        required: true
    },
    location: {
        type: String,
        required: true
    },
    dateLostFound: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: [
            'open', 
            'transferred to campus security office', 
            'kept by finder', 
            'claimed by owner',
            'closed'
        ],
        default: 'open'
    },
    color: { type: String },
    brand: { type: String }
}, {
    timestamps: true
});

itemSchema.index({ type: 1, status: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ dateLostFound: -1 });

module.exports = mongoose.model('Item', itemSchema);