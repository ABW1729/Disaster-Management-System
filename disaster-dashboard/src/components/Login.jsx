import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../api';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
 const navigate = useNavigate();
  const handleLogin = async () => {
    try {
      const res =await loginUser(username,password);
      onLogin({ username, role: res.data.role , id:res.data.id });
      navigate('/dashboard');
   
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
      />
      <button onClick={handleLogin} style={{ width: '100%' }}>Login</button>
      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
    </div>
  );
}
