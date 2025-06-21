import { useState } from 'react';
import axios from 'axios';
import React from 'react';

export default function AddResourceForm({ disasterId, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    location_name: '',
    type: 'shelter',
  });

  const addResource = async () => {
    if (!disasterId) return alert('Disaster not selected');
    try {
      const res = await addResource(disasterId,form);
      alert('Resource added!');
      setForm({
        name: '',
        location_name: '',
        type: 'shelter',
      });
      onSuccess?.();
    } catch (err) {
      console.error('Failed to add resource:', err);
      alert('Failed to add resource');
    }
  };

  return (
    <div>
      <h4>Add New Resource</h4>
      <input
        placeholder="Name"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
      />
      <input
        placeholder="Location Name"
        value={form.location_name}
        onChange={e => setForm({ ...form, location_name: e.target.value })}
      />
      <select
        value={form.type}
        onChange={e => setForm({ ...form, type: e.target.value })}
      >
        <option value="shelter">Shelter</option>
        <option value="medical">Medical</option>
        <option value="food">Food</option>
      </select>
      <button onClick={addResource}>Add Resource</button>
    </div>
  );
}
