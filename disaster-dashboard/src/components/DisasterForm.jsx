import { useState } from 'react';
import { createDisaster, geocode } from '../api';
import React from 'react';
import { useOutletContext } from 'react-router-dom';
export default function DisasterForm() {
    const {
     user
    } = useOutletContext();
  const [form, setForm] = useState({
    title: '',
    location_name: '',
    description: '',
    tags: '',
    lat: '',
    lng: '',
  });
  
 

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGeocode = async () => {
    const res = await geocode(form.description);
    setForm(prev => ({
      ...prev,
      location_name: res.data.extracted_location,
      lat: res.data.lat,
      lng: res.data.lng,
    }));
  };
 const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
  if (!form.title || !form.description || !form.lat || !form.lng) {
    alert('Please fill all required fields.');
    return;
  }

  setLoading(true);
  const payload = {
    ...form,
    tags: form.tags.split(',').map(t => t.trim()),
    lat: parseFloat(form.lat),
    lng: parseFloat(form.lng),
  };
  await createDisaster(payload);
  setLoading(false);
  onCreated?.();
  setForm({ title: '', location_name: '', description: '', tags: '', lat: '', lng: '' });
};

  return (
    <div className="card">
      <h2>Create Disaster</h2>
      <input name="title" placeholder="Title" value={form.title} onChange={handleChange} />
      <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
     <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <button onClick={handleGeocode}>Find Geocode</button></div>
      <input name="location_name" placeholder="Location Name" value={form.location_name} onChange={handleChange} />
      <input name="tags" placeholder="Tags (comma separated)" value={form.tags} onChange={handleChange} />
      <input name="lat" placeholder="Latitude" value={form.lat} onChange={handleChange} />
      <input name="lng" placeholder="Longitude" value={form.lng} onChange={handleChange} />
     <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <button onClick={handleSubmit} disabled={loading}></div>
  {loading ? 'Submitting...' : 'Submit'}
</button>

    </div>
  );
}
