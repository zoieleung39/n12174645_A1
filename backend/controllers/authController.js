const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    const { name, studentNumber, password, email, phone } = req.body;
    
    try {
        // Check if student number already exists
        const userExists = await User.findOne({ studentNumber });
        if (userExists) {
            return res.status(400).json({ message: 'Student number already registered' });
        }

        // Create user
        const user = await User.create({ 
            name, 
            studentNumber, 
            password, 
            email: email || '',
            phone: phone || ''
        });

        res.status(201).json({ 
            id: user.id, 
            name: user.name, 
            studentNumber: user.studentNumber,
            email: user.email,
            phone: user.phone,
            token: generateToken(user.id) 
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    console.log('=== LOGIN DEBUG ===');
    console.log('Request body:', req.body);
    
    const { studentNumber, password } = req.body;
    console.log('Looking for studentNumber:', studentNumber);
    
    try {
        const user = await User.findOne({ studentNumber });
        console.log('User found:', user ? 'YES' : 'NO');
        
        if (user) {
            console.log('Found user:', user.name, user.studentNumber);
            const passwordMatch = await bcrypt.compare(password, user.password);
            console.log('Password match:', passwordMatch);
        }
        
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({ 
                id: user.id, 
                name: user.name, 
                studentNumber: user.studentNumber,
                email: user.email,
                phone: user.phone,
                token: generateToken(user.id) 
            });
        } else {
            console.log('Login failed - sending error response');
            res.status(401).json({ message: 'Invalid student number or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            name: user.name,
            studentNumber: user.studentNumber,
            email: user.email,
            phone: user.phone,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, email, phone } = req.body;
        
        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;

        const updatedUser = await user.save();
        
        res.json({ 
            id: updatedUser.id, 
            name: updatedUser.name, 
            studentNumber: updatedUser.studentNumber,
            email: updatedUser.email,
            phone: updatedUser.phone,
            token: generateToken(updatedUser.id) 
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, updateUserProfile, getProfile };