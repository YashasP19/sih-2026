import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, ExternalLink, ThumbsUp } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

// Fix Leaflet's default icon path issue in Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Category colored custom markers
const createCustomIcon = (urgency, category) => {
  let color = '#3b82f6'; // default blue
  if (urgency === 'CRITICAL') color = '#e11d48';
  else if (urgency === 'HIGH') color = '#f97316';
  else if (category === 'WASTE_GARBAGE') color = '#10b981';
  else if (category === 'STREETLIGHT_POWER') color = '#eab308';
  else if (category === 'ROADS_POTHOLES') color = '#f59e0b';

  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: #ffffff;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

function LocationPicker({ onLocationSelect, selectedPosition }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return selectedPosition ? (
    <Marker position={selectedPosition} icon={createCustomIcon('CRITICAL', 'OTHER')}>
      <Popup>Selected Complaint GPS Location</Popup>
    </Marker>
  ) : null;
}

function CenterMapOnPosition({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function MapComponent({
  complaints = [],
  center = [28.6328, 77.2197], // Default to Central Delhi / New Delhi
  zoom = 13,
  height = '480px',
  allowPickLocation = false,
  selectedPosition = null,
  onLocationSelect = null,
  onUpvote = null,
}) {
  const [currentCenter, setCurrentCenter] = useState(center);

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          setCurrentCenter(newPos);
          if (onLocationSelect) {
            onLocationSelect(pos.coords.latitude, pos.coords.longitude);
          }
        },
        (err) => {
          console.warn('Geolocation error:', err);
        }
      );
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-civic-line shadow-soft dark:shadow-soft-dark" style={{ height }}>
      {allowPickLocation && (
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <button
            type="button"
            onClick={handleLocateMe}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-civic-teal hover:bg-civic-teal-dark text-white rounded-xl text-xs font-semibold shadow-lift dark:bg-teal-600 dark:hover:bg-teal-500 dark:shadow-lift-dark transition-all duration-200 hover:scale-105"
          >
            <Navigation className="w-4 h-4" />
            <span>Use My GPS</span>
          </button>
        </div>
      )}

      {allowPickLocation && (
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 border border-civic-line px-3.5 py-1.5 rounded-xl text-xs text-civic-mute shadow-soft">
          Click on the map to place/adjust grievance pin
        </div>
      )}

      <MapContainer
        center={currentCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <CenterMapOnPosition center={currentCenter} />

        {allowPickLocation && onLocationSelect && (
          <LocationPicker
            onLocationSelect={onLocationSelect}
            selectedPosition={selectedPosition}
          />
        )}

        {!allowPickLocation &&
          complaints.map((item) => {
            if (!item.latitude || !item.longitude) return null;
            const lat = parseFloat(item.latitude);
            const lon = parseFloat(item.longitude);
            if (isNaN(lat) || isNaN(lon)) return null;

            return (
              <Marker
                key={item.id || item.ticket_id}
                position={[lat, lon]}
                icon={createCustomIcon(item.urgency, item.category)}
              >
                <Popup>
                  <div className="p-2 min-w-[220px]">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono text-civic-teal">{item.ticket_id}</span>
                      <PriorityBadge urgency={item.urgency} score={item.priority_score} />
                    </div>
                    <h4 className="text-sm font-bold text-civic-ink mb-1.5 leading-snug">{item.title}</h4>
                    <p className="text-xs text-civic-mute mb-2 line-clamp-2">{item.address || item.category_display}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-civic-line text-xs">
                      <StatusBadge status={item.status} size="xs" />
                      {onUpvote && (
                        <button
                          onClick={() => onUpvote(item.id)}
                          className="flex items-center gap-1 text-civic-mute hover:text-civic-teal font-medium"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{item.upvotes_count || 0}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
}
