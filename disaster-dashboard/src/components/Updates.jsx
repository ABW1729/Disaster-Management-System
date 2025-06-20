import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AlertsTable from './AlertTable';
import { getUpdates } from '../api';


export default function OfficialUpdates() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchNDMA = async () => {
      setLoading(true); 
      try {
        const res = await getUpdates();
        setUpdates(res.data || []);
      } catch (err) {
        console.error('Error fetching official updates:', err.message);
      } finally {
        setLoading(false); 
      }
    };
    fetchNDMA();
  }, []);

  if (loading) {
    return (
      <div className="card">
        <h2>🛑 Alerts</h2>
        <h3>This may take some time</h3>
       <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="card">
      <h2>🛑 Alerts</h2>
      <AlertsTable data={updates} />
    </div>
  );
}
