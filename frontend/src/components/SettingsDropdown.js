// frontend/src/components/SettingsDropdown.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/SettingsDropdown.css';

function SettingsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Initial user check
    checkUserState();

    // Set up polling for user state
    const intervalId = setInterval(checkUserState, 1000);

    // Handle clicks outside dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const checkUserState = () => {
    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    
    // Only update state if there's a change
    if (JSON.stringify(user) !== JSON.stringify(currentUser)) {
      setUser(currentUser);
    }
  };

  const handleSignOut = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/signout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });

      if (response.ok) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setIsOpen(false);
        navigate('/signin');
      }
    } catch (error) {
      console.error('Signout failed:', error);
    }
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="settings-container">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        onMouseEnter={() => setIsOpen(true)}
        className="settings-button"
      >
        Settings
      </button>

      {isOpen && (
        <div 
          className="settings-dropdown"
          onMouseLeave={() => setIsOpen(false)}
        >
          <ul>
            {user ? (
              <>
                <li>
                  <Link 
                    to="/profile" 
                    onClick={handleLinkClick}
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/achievements" 
                    onClick={handleLinkClick}
                  >
                    Achievements
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/my-workout" 
                    onClick={handleLinkClick}
                  >
                    My Workouts
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/schedule" 
                    onClick={handleLinkClick}
                  >
                    Workout Schedule
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={handleSignOut} 
                    className="signout-button"
                  >
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link 
                    to="/signin" 
                    onClick={handleLinkClick}
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/signup" 
                    onClick={handleLinkClick}
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SettingsDropdown;