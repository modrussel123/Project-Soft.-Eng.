// frontend/src/pages/SignOut.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function SignOut() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || !user.email) {
      alert('No user found to sign out');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/signout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });

      if (response.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log(`✅ User signed out: ${user.email}`);
        navigate('/signin');
      } else {
        const data = await response.json();
        alert(`Signout failed: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Signout Error:', error);
    }
  };

  return (
    <div>
      <h2>Sign Out</h2>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
}

export default SignOut;
