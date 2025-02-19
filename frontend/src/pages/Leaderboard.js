// frontend/src/pages/Leaderboard.js
import React from 'react';
import '../styles/Leaderboard.css';

function Leaderboard() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    return (
      <div className="leaderboard-container">
        <h2>Leaderboard</h2>
        <p className="leaderboard-message">You must sign in first to access the leaderboard.</p>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <h2>Leaderboard</h2>
      <p className="leaderboard-content">Here is the leaderboard content...</p>
    </div>
  );
}

export default Leaderboard;
