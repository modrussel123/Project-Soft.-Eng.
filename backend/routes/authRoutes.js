// backend/routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`⚠️ Signup failed: Email ${email} is already in use`);
      return res.status(400).json({ error: 'Email is already in use' });
    }
    const user = new User({ firstName, lastName, email, password });
    await user.save();
    console.log(`✅ User signed up: ${email}`);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('❌ Signup Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`⚠️ Signin failed: Email ${email} not found`);
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`⚠️ Signin failed: Incorrect password for ${email}`);
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, 'secret', { expiresIn: '1h' });
    console.log(`✅ User signed in: ${email}`);
    res.json({ token, user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email } });
  } catch (error) {
    console.error('❌ Signin Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post('/signout', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required for signout' });
    console.log(`✅ User signed out successfully: ${email}`);
    res.json({ message: 'User signed out successfully' });
  } catch (error) {
    console.error('❌ Signout Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
