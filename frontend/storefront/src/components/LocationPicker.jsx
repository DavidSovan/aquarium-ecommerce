import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  const markerRef = useRef(null);
  
  useEffect(() => {
    if (position && position.lat !== undefined && position.lng !== undefined) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position && position.lat !== undefined && position.lng !== undefined ? (
    <Marker 
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition(pos);
        },
      }}
      position={position} 
      ref={markerRef}
    />
  ) : null;
}

export function LocationPicker({ value, onChange }) {
  const [position, setPosition] = useState(
    value?.latitude && value?.longitude 
      ? { lat: value.latitude, lng: value.longitude } 
      : { lat: 11.5564, lng: 104.9282 }
  );

  useEffect(() => {
    if (value?.latitude && value?.longitude) {
      setPosition({ lat: value.latitude, lng: value.longitude });
    }
  }, [value]);

  const handleSetPosition = (pos) => {
    setPosition(pos);
    onChange({ latitude: pos.lat, longitude: pos.lng });
  };

  const handleCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleSetPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => {
          alert('Could not get current location: ' + err.message);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Delivery Location</label>
        <button 
          type="button" 
          onClick={handleCurrentLocation}
          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
        >
          Use My Current Location
        </button>
      </div>
      <div style={{ height: '300px', width: '100%', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', zIndex: 0 }}>
        <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 1 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={handleSetPosition} />
        </MapContainer>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Click or drag the marker to pinpoint your exact location.</p>
    </div>
  );
}
