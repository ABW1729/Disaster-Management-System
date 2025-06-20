import React, { useState } from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import LoginPage from './components/Login';
import DashBoard from './components/DashBoard';
import DisasterForm from './components/DisasterForm'; 
import DisasterList from './components/DisasterList';
import SocialFeed from './components/SocialFeed';
import MapView from './components/Mapview';
import DisasterResources from './components/Resource';
import OfficialUpdates from './components/Updates';
import ImageVerification from './components/Verification';
import AppLoader from './AppLoader';
import ReportList from './components/Reports';

export default function App() {
 const [user, setUser] = useState(null);
  return (
   
  <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LoginPage onLogin={setUser} />} />
        <Route path="/dashboard" element={<AppLoader user={user} />}>
         <Route index element={<DisasterForm />} /> 
         <Route path="create" element={<DisasterForm />} />
          <Route path="disasters" element={<DisasterList />} />
          <Route path="resources" element={<DisasterResources />} />
          <Route path="social" element={<SocialFeed />} />
          <Route path="updates" element={<OfficialUpdates />} />
          <Route path="verification" element={<ImageVerification  />} />
          <Route path="reports" element={<ReportList />} />
          <Route path="map" element={<MapView />} />
        </Route>

        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}