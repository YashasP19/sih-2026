import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

export default function HeatmapView({ complaints = [], center = [28.6328, 77.2197], zoom = 12, height = '450px' }) {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-civic-line shadow-soft" style={{ height }}>
      <div className="absolute top-4 right-4 z-20 bg-white/95 border border-civic-line px-4 py-2 rounded-xl text-xs shadow-soft flex flex-wrap items-center gap-3 max-w-[90%]">
        <span className="font-semibold text-civic-ink">Grievance Intensity:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500"></span>
          <span className="text-civic-mute">Critical & High (75+)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <span className="text-civic-mute">Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-civic-teal"></span>
          <span className="text-civic-mute">Resolved / Low</span>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {complaints.map((c) => {
          if (!c.latitude || !c.longitude) return null;
          const lat = parseFloat(c.latitude);
          const lon = parseFloat(c.longitude);
          if (isNaN(lat) || isNaN(lon)) return null;

          const isCritical = c.priority_score >= 75 || c.urgency === 'CRITICAL';
          const isMedium = c.priority_score >= 45 && c.priority_score < 75;

          const fillColor = isCritical ? '#f43f5e' : isMedium ? '#f59e0b' : '#0D7377';
          const radius = isCritical ? 24 : isMedium ? 18 : 12;

          return (
            <CircleMarker
              key={c.id || c.ticket_id}
              center={[lat, lon]}
              radius={radius}
              pathOptions={{
                color: fillColor,
                fillColor: fillColor,
                fillOpacity: 0.35,
                weight: 2,
              }}
            >
              <Popup>
                <div className="p-1">
                  <p className="font-bold text-civic-ink text-xs">{c.title}</p>
                  <p className="text-[11px] text-civic-mute mt-1">Ward: {c.ward_number || 'Zone Central'}</p>
                  <p className="text-[11px] font-semibold text-rose-600 mt-0.5">Priority Index: {c.priority_score}/100</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
