import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBicycle, FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaArrowRight } from 'react-icons/fa';
import '../styles/Signup.css';

function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password })
      });
      if (response.ok) {
        navigate('/signin');
      } else {
        alert('Sign up failed');
      }
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <FaBicycle size={50} className="signup-icon" />
          <h1 className="signup-title">GYMFLOW</h1>
          <p className="signup-subtitle">Join the Community</p>
        </div>
        
        <form className="signup-form" onSubmit={handleSignUp}>
          <div className="signup-input-container">
            <FaUser className="signup-input-icon" />
            <input 
              type="text" 
              placeholder="First Name" 
              className="signup-input"
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              required 
            />
          </div>
          <div className="signup-input-container">
            <FaUser className="signup-input-icon" />
            <input 
              type="text" 
              placeholder="Last Name" 
              className="signup-input"
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)} 
              required 
            />
          </div>
          <div className="signup-input-container">
            <FaEnvelope className="signup-input-icon" />
            <input 
              type="email" 
              placeholder="Email" 
              className="signup-input"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="signup-input-container">
            <FaLock className="signup-input-icon" />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              className="signup-input"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <button 
              type="button" 
              className="signup-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <FaEye className="signup-password-icon" />
              ) : (
                <FaEyeSlash className="signup-password-icon" />
              )}
            </button>
          </div>
          <button type="submit" className="signup-button">
            SIGN UP
            <FaArrowRight />
          </button>
        </form>
        <div className="signup-login-link">
          Already have an account? <a href="/signin">Sign In</a>
        </div>
      </div>
    </div>
  );
}

export default SignUp;