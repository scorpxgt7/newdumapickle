import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Court } from '../types';
import { MapPin, Navigation } from 'lucide-react';

interface CourtMapProps {
  courts: Court[];
  selectedCourt: Court | null;
  onSelectCourt: (court: Court) => void;
}

export default function CourtMap({ courts, selectedCourt, onSelectCourt }: CourtMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const [currentZoom, setCurrentZoom] = useState<number>(12);

  const defaultCenter: [number, number] = selectedCourt?.coordinates 
    ? [selectedCourt.coordinates.lat, selectedCourt.coordinates.lng]
    : courts.length > 0 
      ? [courts[0].coordinates.lat, courts[0].coordinates.lng]
      : [9.3090, 123.2933];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map if not already done with custom zoom control disabled
    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        scrollWheelZoom: true,
      }).setView(defaultCenter, 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      map.on('zoomend', () => {
        setCurrentZoom(map.getZoom());
      });

      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;

    // Clear old markers
    (Object.values(markersRef.current) as L.Marker[]).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add court markers
    courts.forEach(court => {
      const isSelected = selectedCourt?.id === court.id;
      const markerBg = isSelected ? '#059669' : (court.isPremium ? '#10b981' : '#2563eb');
      
      const customIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div style="
            background-color: ${markerBg};
            width: ${isSelected ? '34px' : '28px'};
            height: ${isSelected ? '34px' : '28px'};
            border-radius: 50%;
            border: 2.5px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            color: white;
            font-size: ${isSelected ? '14px' : '11px'};
            font-weight: bold;
            transition: all 0.2s ease;
            cursor: pointer;
          ">
            🎾
          </div>
        `,
        iconSize: [isSelected ? 34 : 28, isSelected ? 34 : 28],
        iconAnchor: [isSelected ? 17 : 14, isSelected ? 17 : 14],
      });

      const marker = L.marker([court.coordinates.lat, court.coordinates.lng], { icon: customIcon })
        .addTo(map);

      const popupContent = `
        <div class="leaflet-court-popup-card" style="
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          width: 230px;
          border-radius: 14px;
          overflow: hidden;
          background: #ffffff;
        ">
          <!-- Court Photo Cover Banner -->
          <div style="position: relative; height: 95px; background: #e2e8f0; overflow: hidden;">
            <img src="${court.image}" alt="${court.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='https://upload.wikimedia.org/wikipedia/commons/3/39/Outdoor_pickleball_courts.jpg';" />
            
            <div style="
              position: absolute;
              top: 8px;
              right: 8px;
              background: rgba(15, 23, 42, 0.85);
              backdrop-filter: blur(4px);
              color: white;
              padding: 2px 8px;
              border-radius: 20px;
              font-size: 10px;
              font-weight: 800;
              display: flex;
              align-items: center;
              gap: 3px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            ">
              <span style="color: #fbbf24;">★</span> ${court.rating > 0 ? court.rating.toFixed(1) : 'New'}
            </div>

            ${court.isPremium ? `
              <div style="
                position: absolute;
                top: 8px;
                left: 8px;
                background: #059669;
                color: white;
                padding: 2px 8px;
                border-radius: 20px;
                font-size: 9px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              ">
                Premium
              </div>
            ` : ''}
          </div>

          <div style="padding: 12px 14px; position: relative;">
            <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800; color: #0f172a; line-height: 1.2;">${court.name}</h4>
            <p style="margin: 0 0 10px 0; font-size: 11px; color: #64748b; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${court.address}</p>
            
            <div style="display: flex; gap: 6px; margin-bottom: 12px;">
              <span style="background: #f1f5f9; color: #475569; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700;">${court.indoor ? 'Indoor' : 'Outdoor'}</span>
              <span style="background: #f1f5f9; color: #475569; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700;">${court.fee}</span>
            </div>

            <button id="select-btn-${court.id}" style="
              width: 100%;
              background: #059669;
              color: white;
              border: none;
              padding: 8px;
              border-radius: 8px;
              font-size: 11px;
              font-weight: 800;
              cursor: pointer;
              transition: all 0.2s;
            ">
              View Court Details
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        className: 'custom-leaflet-popup',
        maxWidth: 250,
        minWidth: 230,
        offset: [0, -10]
      });

      marker.on('popupopen', () => {
        // We use setTimeout to ensure the DOM elements exist in the popup before attaching event listener
        setTimeout(() => {
          const btn = document.getElementById(`select-btn-${court.id}`);
          if (btn) {
            btn.onclick = () => {
              onSelectCourt(court);
              marker.closePopup();
            };
          }
        }, 50);
      });

      // Show popup automatically for selected court
      if (isSelected) {
        setTimeout(() => {
          marker.openPopup();
        }, 100);
      }

      markersRef.current[court.id] = marker;
    });

  }, [courts, selectedCourt, onSelectCourt]);

  // Center map on selected court when it changes externally
  useEffect(() => {
    if (selectedCourt && leafletMapRef.current) {
      leafletMapRef.current.setView(
        [selectedCourt.coordinates.lat, selectedCourt.coordinates.lng],
        currentZoom
      );
    }
  }, [selectedCourt, currentZoom]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm space-y-0">
      {/* Header controls */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm">
              Interactive Court Map Navigator
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {courts.length} verified courts on map
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedCourt && (
            <div className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 font-medium px-3 py-1 rounded-full border border-emerald-200/50 flex items-center gap-1.5">
              <Navigation className="w-3 h-3 text-emerald-600" />
              Focused: <span className="font-bold truncate max-w-[140px]">{selectedCourt.name}</span>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          padding: 0;
          overflow: hidden;
          border-radius: 14px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(0,0,0,0.05);
        }
        .custom-leaflet-popup .leaflet-popup-content {
          margin: 0;
          width: 230px !important;
        }
        .custom-leaflet-popup .leaflet-popup-tip-container {
          display: none; /* Hide default triangle tip */
        }
      `}} />

      {/* Map Body */}
      <div className="w-full h-[380px] md:h-[420px] relative" ref={mapContainerRef}>
      </div>
    </div>
  );
}
