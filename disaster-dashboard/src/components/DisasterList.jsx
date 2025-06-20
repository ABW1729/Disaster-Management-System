import { useEffect, useState } from 'react';
import axios from 'axios';
import { deleteDisaster, getDisasters } from '../api';
import AddResourceForm from './AddResource.jsx';
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { io } from 'socket.io-client';
import socket from '../socket';
export default function DisasterList() {
    const {
    disasters,           
    setDisasters,
    reload,
    setReload,
    disaster,
    setDisaster,
    user
    } = useOutletContext();
  const [list, setList] = useState([]);
  const [openFormId, setOpenFormId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editDisasterId, setEditDisasterId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    location_name: '',
    tags: '',
    description: '',
  });
const fetchDisasters = async () => {
  setLoading(true);
  try {
    const res = await getDisasters();
    setList(res.data.disasters);
    setDisasters(res.data.disasters || []);
  } catch (err) {
    console.error('Error fetching disasters:', err);
  } finally {
    setLoading(false);
  }
};


 useEffect(() => {
  fetchDisasters();
  const handleUpdate = () => fetchDisasters();
  socket.on('disaster_updated', handleUpdate);
  socket.emit('start_disaster_tracking', { user_id: user?.id || 'guest' });

  return () => {
    socket.off('disaster_updated', handleUpdate);
  };
}, []); 

  const toggleForm = (id) => {
    setOpenFormId((prev) => (prev === id ? null : id));
  };

  const handleDelete = async (id) => {
    try {
      await deleteDisaster(id);
      fetchDisasters();
    } catch (err) {
      console.error('Failed to delete disaster:', err);
    }
  };

  const handleUpdate = async (disaster) => {
      try {
          await updateDisaster(disaster.id, {
          title: newTitle,
          location_name: newLocationName,
          description: newDesc,
          tags: newTagsArray,
          owner_id: user.id
        });
        fetchDisasters(); 
      } catch (err) {
        console.error('Failed to update disaster:', err);
      }
    
  };

  return (
    <div className="card">
      <h2>All Disasters</h2>
      {loading ? (
        <p>Loading disasters...</p>
      ) : list.length === 0 ? (
        <p>No disasters found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Location</th>
              <th>Description</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((d) => (
              <React.Fragment key={d.id}>
                <tr style={{ borderBottom: '1px solid #ccc' }}>
                  <td>{d.title}</td>
                  <td>{d.location_name}</td>
                  <td>{d.description}</td>
                  <td>{d.tags?.join(', ') || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => toggleForm(d.id)}>
                        {openFormId === d.id ? 'Cancel' : 'Add Resource'}
                      </button>
                      <button
                        onClick={() => {
                          setEditDisasterId(d.id);
                          setEditForm({
                            title: d.title || '',
                            location_name: d.location_name || '',
                            tags: (d.tags || []).join(', '),
                            description: d.description || '',
                          });
                          setEditModalOpen(true);
                        }}
                      >
                        Update
                      </button>
                      <button onClick={() => handleDelete(d.id)} >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                {openFormId === d.id && (
                  <tr>
                    <td colSpan="5"> 
                      <AddResourceForm
                        disasterId={d.id}
                        onSuccess={() => {
                          setOpenFormId(null);
                        }}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
            {editModalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Edit Disaster</h3>
            <input
              placeholder="Title"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            />
            <input
              placeholder="Location Name"
              value={editForm.location_name}
              onChange={(e) => setEditForm({ ...editForm, location_name: e.target.value })}
            />
            <input
              placeholder="Tags (comma separated)"
              value={editForm.tags}
              onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
            />
            <textarea
              placeholder="Description"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={async () => {
                  try {
                    await axios.put(`http://localhost:5000/disasters/${editDisasterId}`, {
                      title: editForm.title,
                      location_name: editForm.location_name,
                      tags: editForm.tags.split(',').map(tag => tag.trim()),
                      description: editForm.description,
                    });
                    setEditModalOpen(false);
                    fetchDisasters();
                  } catch (err) {
                    console.error('Update error', err);
                  }
                }}
              >
                Submit
              </button>
              <button onClick={() => setEditModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
