import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useOutletContext } from 'react-router-dom';
import { getSocialFeed } from '../api';
import socket from '../socket';
export default function SocialFeed({  }) {
   const {
    disasters,           
    setDisasters,
    reload,
    setReload,
    disaster,
    setDisaster
  } = useOutletContext();
  const [feed, setFeed] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [imageURL, setImageURL] = useState('');
  const [imageResult, setImageResult] = useState('');
  const [onlyPriority, setOnlyPriority] = useState(false);

  const filtered = onlyPriority ? feed.filter(p => p.priority) : feed;



    useEffect(() => {
      if (!disaster?.id) return;

      const fetchFeed = async () => {
        try {
          const res = await getSocialFeed(disaster.id);
          const tweetPosts = res.data.map(t => ({
            user: `@${t.author_id}`,
            post: t.text,
            priority: t.text.toLowerCase().includes('urgent') || t.text.toLowerCase().includes('help'),
          }));
          setFeed(tweetPosts);
        } catch (err) {
          console.error('Tweet fetch error:', err);
          setFeed([]);
        }
      };

      fetchFeed();

      const handleTweetUpdate = ({ disaster_id, posts }) => {
        if (disaster_id === disaster.id) {
          const newPosts = posts.map(t => ({
            user: `@${t.author_id}`,
            post: t.text,
            priority: t.text.toLowerCase().includes('urgent') || t.text.toLowerCase().includes('help'),
          }));
          console.log(`[SOCKET] New tweets received for disaster ${disaster_id}`);
          setFeed(prev => [...prev, ...newPosts]);
        }
      };

      socket.on('social_media_updated', handleTweetUpdate);

   
      return () => {
        socket.off('social_media_updated', handleTweetUpdate);
      };
    }, [disaster]);


  return (
    <div className="card">
      <h2>Live Feed</h2>

      <select
        value={disaster?.id || ''}
        onChange={e => {
          const selected = disasters.find(d => d.id === e.target.value);
          setDisaster(selected);
          setFeed([]);
        }}
      >
        <option value="">Select a disaster</option>
        {disasters.map(d => (
          <option key={d.id} value={d.id}>
            {d.title || d.description || d.location_name}
          </option>
        ))}
      </select>

      {disaster ? (
        <>
          <h3>Social Media</h3>
          <label>
            <input
              type="checkbox"
              checked={onlyPriority}
              onChange={e => setOnlyPriority(e.target.checked)}
            /> Show only urgent alerts
          </label>
          <ul>
            {filtered.map((p, i) => (
              <li key={i}>
                <span style={{ color: p.priority ? 'red' : 'black' }}>
                  {p.user}: {p.post} {p.priority && '🚨'}
                </span>
              </li>
            ))}
          </ul>

       
        </>
      ) : (
        <p>Select a disaster to view feed.</p>
      )}
    </div>
  );
}
