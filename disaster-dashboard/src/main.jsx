import React from 'react';
import ReactDOM from 'react-dom/client';
import AppLoader from './AppLoader.jsx';
import App from './App.jsx';
import './style.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import LoginPage from './components/Login.jsx';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  
  <React.StrictMode> 
   <App />
  </React.StrictMode>
);
