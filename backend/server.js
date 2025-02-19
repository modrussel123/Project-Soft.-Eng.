require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const workoutRoutes = require('./routes/workoutRoutes'); 
const profileRoutes = require('./routes/profileRoutes');
const path = require('path');
const workoutScheduleRoutes = require('./routes/workoutScheduleRoutes');
const streakRoutes = require('./routes/streakRoutes'); // Import the streak routes
const friendRoutes = require("./routes/friendRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/workout-schedule', workoutScheduleRoutes);
app.use('/api/streak', streakRoutes); // Change this line
app.use("/api/friends", friendRoutes);

console.log("🚀 Server.js is running...");

// Ensure MongoDB URI is set
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error("❌ ERROR: MONGO_URI is not defined in .env file!");
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Base route
app.get('/', (req, res) => {
  res.send('🚀 Gym Web App Backend is Running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));