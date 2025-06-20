import React, { useEffect, useState } from 'react';
import DashBoard from './components/DashBoard';
import axios from 'axios';
import {Link, Outlet } from 'react-router-dom';
import { getDisasters } from './api';

export default function AppLoader({role,user}) {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        const res = await getDisasters();
        setDisasters(res.data.disasters || []);
      } catch (err) {
        console.error('Error loading disasters:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDisasters();
  }, []);

  if (loading) return <p style={{ textAlign: 'center' }}>Loading disasters...</p>;

  return  <DashBoard role={role} disasters={disasters} user={user}><Outlet /></DashBoard>;;
}