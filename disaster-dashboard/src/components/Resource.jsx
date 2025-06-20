import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getNearbyResources } from '../api';
import socket from '../socket';
export default function DisasterResources() {
    const {
    disasters,           
    setDisasters,
    reload,
    setReload,
    disaster,
    setDisaster
  } = useOutletContext();

  const [resources, setResources] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [radius, setRadius] = useState(''); 
  const [form, setForm] = useState({
    name: '',
    location_name: '',
    lat: '',
    lng: '',
    type: 'shelter',
  });

  
   const fetchResources = async () => {
    if (!disaster) return;
    try {
      const res = await getNearbyResources(disaster.id,disaster.lat,disaster.lng,radius);
      setResources(res.data.nearby_resources || []);
       setHasSearched(true);
    } catch (err) {
      console.error('Error fetching resources:', err);
       setHasSearched(true);
    }
  };

 
  useEffect(() => {
    const handleNearbyFetched = (payload) => {
      if (payload.disaster_id === disaster?.id) {
        setResources((prev) => [...prev, ...payload.data]);
      }
    };
    socket.on('nearby_fetched', handleNearbyFetched);
    return () => {
      socket.off('nearby_fetched', handleNearbyFetched); 
    };
  }, [disaster?.id]);

  const addResource = async () => {
    try {
      const res = addResource(disaster.id,form);
      setForm({ name: '', location_name: '', lat: disaster.lat, lon: disaster.lon, type: 'shelter' });
      fetchResources();
    } catch (err) {
      console.error('Error adding resource:', err);
    }
  };

  return (
    <div className="card">
      <h3>Disaster Resource Manager</h3>

     
      <select
        value={disaster?.id || ''}
        onChange={(e) => {
          const d = disasters.find(d => d.id === e.target.value);
          setDisaster(d);
          setResources([]);
        }}
      >
        <option value="">Select a disaster</option>
        {disasters.map((d) => (
          <option key={d.id} value={d.id}>
            {d.title || d.description || d.location_name}
          </option>
        ))}
      </select>

      {!disaster ? (
        <p>Select a disaster to find nearby resources.</p>
      ) : (
        <>
          <h4>Nearby Resources for {disaster.title || disaster.location_name}</h4>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              placeholder="Enter Search Radius (meters)"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
            />
            <button onClick={fetchResources}>Find Nearby Resources</button>
          </div>

       <ul>
        {hasSearched && resources.length === 0 ? (
            <p>No resources found.</p>
        ) : (
            resources.map((r, i) => (
            <li key={i}>
                <b>{r.name}</b> ({r.type}) — {r.location_name}
            </li>
            ))
        )}
        </ul>

        
        </>
      )}
    </div>
  );
}
