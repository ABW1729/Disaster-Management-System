import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useOutletContext, Navigate } from 'react-router-dom';
import { addImage } from '../api';
export default function ImageVerification() {
  const [selected, setSelected] = useState(null);
  const [imageURL, setImageURL] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  const {
    disasters,
    user
  } = useOutletContext();

  if (!user) return <Navigate to="/" />;

  const handleSubmit = async () => {
    if (!selected?.id || !imageURL || !content) return;

    try {
      
       const res = await addImage(selected.id,imageURL,user.id,content);
      setMessage('✅ Report submitted successfully. Awaiting verification.');
      setImageURL('');
      setContent('');
    } catch (err) {
      console.error('Submit error', err);
      setMessage('❌ Failed to submit report.');
    }
  };

  return (
    <div className="card">
      <h2>🖼️ Submit Disaster Report</h2>

      <label>Select Disaster:</label>
      <select
        value={selected?.id || ''}
        onChange={(e) => {
          const d = disasters.find(x => x.id === e.target.value);
          setSelected(d);
        }}
      >
        <option value="">Select</option>
        {disasters.map(d => (
          <option key={d.id} value={d.id}>
            {d.title || d.description || d.location_name}
          </option>
        ))}
      </select>

      <br /><br />
      <textarea
        placeholder="Enter description of what you see"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <br />
      <input
        value={imageURL}
        onChange={e => setImageURL(e.target.value)}
        placeholder="Paste image URL here"
      />
      <button onClick={handleSubmit}>Submit Report</button>

      {message && <p>{message}</p>}
    </div>
  );
}
