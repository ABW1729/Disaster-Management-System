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
  if (user?.role !== 'admin') {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '60vh', 
      textAlign: 'center' 
    }}>
      <p style={{ color: 'gray', fontSize: '1.2rem' }}>
        Only admins can create disasters.
      </p>
    </div>
  );
}

  return (
     <div className="container">
     <nav className="navbar">
      <div className="nav-links">
        <Link to="/dashboard/create">Form</Link>
        <Link to="/dashboard/disasters">Disaster List</Link>
        <Link to="/dashboard/resources">Resources</Link>
        <Link to="/dashboard/social">Social Feed</Link>
        <Link to="/dashboard/updates">NDMA Alerts</Link>
        <Link to="/dashboard/verification">Image Verification</Link>
        <Link to="/dashboard/reports">Reports</Link>
        <Link to="/dashboard/map">Map View</Link>
      </div>
  <LogoutButton user={user} onLogout={() => setRole(null)} className="logout-button" />
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
