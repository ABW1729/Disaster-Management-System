import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import React from 'react';
import { useOutletContext } from 'react-router-dom';
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapView() {
    const {
    disasters,           
    setDisasters,
    reload,
    setReload,
    disaster,
    setDisaster
  } = useOutletContext();
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [78.9629, 20.5937], 
      zoom: 4,
    });
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    disasters.forEach(d => {
      if (typeof d.lng === 'number' && typeof d.lat === 'number') {
        const marker = new mapboxgl.Marker({
          color:  'red' ,
        })
          .setLngLat([d.lng, d.lat])
          .setPopup(new mapboxgl.Popup().setHTML(`<b>${d.title}</b><br>${d.location_name}`))
          .addTo(map);

        markersRef.current.push(marker);
      }
    });
  }, [disasters]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: '300px',
        borderRadius: '0.5rem',
        marginTop: '1rem',
      }}
    />
  );
}
