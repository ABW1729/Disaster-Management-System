import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import socket from '../socket';
import { logoutUser } from '../api';
import React from 'react';

export default function LogoutButton({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      socket.emit('user_logout', { user_id: user.id });
      socket.disconnect();
      onLogout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <button onClick={handleLogout} style={{ marginLeft: 'auto' }}>
      🔒 Logout
    </button>
  );
}
