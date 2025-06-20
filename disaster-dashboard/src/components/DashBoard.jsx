import '../style.css';
import DisasterForm from './DisasterForm';
import LogoutButton from './Logout';
import DisasterList from './DisasterList';
import SocialFeed from './SocialFeed';
import MapView from './Mapview';
import DisasterResources from './Resource';
import OfficialUpdates from './Updates';
import ImageVerification from './Verification';
import { Link,Outlet} from 'react-router-dom';
import { useState } from 'react';
import React from 'react';
function DashBoard({ role:role,disasters: initialDisasters,user, children }) {
  const [disasters, setDisasters] = useState(initialDisasters);
  const [selected, setSelected] = useState(null);
  const [reload, setReload] = useState(false);
  return (
     <div className="container">
      <nav className="navbar">
        <Link to="/dashboard/create">Form</Link>
        <Link to="/dashboard/disasters">Disaster List</Link>
        <Link to="/dashboard/resources">Resources</Link>
        <Link to="/dashboard/social">Social Feed</Link>
        <Link to="/dashboard/updates">NDMA Alerts</Link>
        <Link to="/dashboard/verification">Image Verification</Link>
        <Link to="/dashboard/reports">Reports</Link>
        <Link to="/dashboard/map">Map View</Link>
       <LogoutButton user={user} onLogout={() => setRole(null)   style={{
            backgroundColor: '#2b6cb0', 
            color: 'white',
            padding: '10px 20px', 
            border: '1px solid black', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold', 
            marginLeft: 'auto',
            textDecoration: 'none',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px', 
            transition: 'background-color 0.2s ease, border-color 0.2s ease',
          }}} />
      </nav>
    
    <Outlet context={{ 
        disasters, setDisasters,
        disaster: selected, setDisaster: setSelected,
        reload, setReload,
        user
      }} />
    </div>
  
  );
}

export default DashBoard;
