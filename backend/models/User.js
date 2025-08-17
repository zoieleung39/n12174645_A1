const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    studentNumber: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
    },
    email: { type: String },
    password: { type: String, required: true },
    phone: { type: String }
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.index({ studentNumber: 1 });

module.exports = mongoose.model('User', userSchema);