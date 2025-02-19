import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBicycle, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight } from 'react-icons/fa';
import '../styles/Signin.css';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-header">
          <FaBicycle size={50} className="signin-icon" />
          <h1 className="signin-title">GYMFLOW</h1>
          <p className="signin-subtitle">Train Hard, Stay Consistent</p>
        </div>
        <form className="signin-form" onSubmit={handleSignIn}>
          <div className="signin-input-container">
            <FaEnvelope size={24} className="signin-input-icon" />
            <input 
              type="email" 
              placeholder="Email" 
              className="signin-input"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="signin-input-container">
            <FaLock size={24} className="signin-input-icon" />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              className="signin-input"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <button 
              type="button" 
              className="signin-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <FaEye size={24} className="signin-password-icon" />
              ) : (
                <FaEyeSlash size={24} className="signin-password-icon" />
              )}
            </button>
          </div>
          <button type="submit" className="signin-button">
            LOGIN
            <FaArrowRight size={24} className="signin-button-icon" />
          </button>
        </form>
        <div className="signin-signup-link">
          <p>Don't have an account? <a href="/signup">Sign Up</a></p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;