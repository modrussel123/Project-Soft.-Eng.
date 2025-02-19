import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import SignOut from './pages/Signout';  // Ensure exact match
import Workouts from './pages/Workouts';
import MyWorkout from './pages/MyWorkout';
import Leaderboard from './pages/Leaderboard';
import Achievements from './pages/Achievements';
import WorkoutSchedule from './pages/WorkoutSchedule';
import Profile from './pages/Profile';

import Header from './components/Header';
import Footer from './components/Footer';

import './styles/App.css'; // Import the global styles

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signout" element={<SignOut />} />  {/* Added SignOut Route */}
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/my-workout" element={<MyWorkout />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/schedule" element={<WorkoutSchedule />} />
        <Route path="/profile" element={<Profile />} />

      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
