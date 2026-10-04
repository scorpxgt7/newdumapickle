import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Court } from '../types';
import { MapPin, Navigation, Maximize2, Layers, Compass, ExternalLink, RefreshCw } from 'lucide-react';

interface MiniCourtMapProps {
  selectedCourt: Court;
  allCourts?: Court[];
  onSelectCourt?: (court: Court) => void;
  height?: string;
}

type MapTileStyle = 'standard' | 'satellite' | 'dark';

export default function MiniCourtMap({
  selectedCourt,
  allCourts = [],
  onSelectCourt,
  height = '240px'
}: MiniCourtMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const [tileStyle, setTileStyle] = useState<MapTileStyle>('standard');
  const [isMapReady, setIsMapReady] = useState(false);

  const getTileUrl = (style: MapTileStyle) => {
    switch (style) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'dark':
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      case 'standard':
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  const getTileAttribution = (style: MapTileStyle) => {
    switch (style) {
      case 'satellite':
        return '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
      case 'dark':
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';
      case 'standard':
      default:
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = selectedCourt.coordinates?.lat || 9.3090;
      const initialLng = selectedCourt.coordinates?.lng || 123.2933;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: false,
        scrollWheelZoom: false,
        touchZoom: true,
        dragging: true,
      });

      const initialLayer = L.tileLayer(getTileUrl(tileStyle), {
        attribution: getTileAttribution(tileStyle),
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = initialLayer;

      const layerGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = layerGroup;

      mapInstanceRef.current = map;
      setIsMapReady(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        tileLayerRef.current = null;
        markersGroupRef.current = null;
      }
    };
  }, []);

  // Update tile layer when style changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const newLayer = L.tileLayer(getTileUrl(tileStyle), {
      attribution: getTileAttribution(tileStyle),
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
  }, [tileStyle]);

  // Update markers and center map when selectedCourt or allCourts changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    group.clearLayers();

    const currentLat = selectedCourt.coordinates?.lat || 9.3090;
    const currentLng = selectedCourt.coordinates?.lng || 123.2933;

    // Pan map smoothly to selected court
    map.flyTo([currentLat, currentLng], 15, {
      duration: 0.8,
      easeLinearity: 0.25,
    });

    // Determine courts to display on mini map
    const courtsToDisplay = allCourts.length > 0 ? allCourts : [selectedCourt];

    courtsToDisplay.forEach((court) => {
      const isSelected = court.id === selectedCourt.id;
      const lat = court.coordinates?.lat;
      const lng = court.coordinates?.lng;

      if (lat === undefined || lng === undefined) return;

      const markerBg = isSelected ? '#10b981' : '#3b82f6';
      const pulseHtml = isSelected ? `
        <div style="
          position: absolute;
          top: -6px;
          left: -6px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.35);
          animation: mini-map-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          pointer-events: none;
        "></div>
      ` : '';

      const customIcon = L.divIcon({
        className: 'mini-court-map-pin',
        html: `
          <div style="position: relative; display: flex; items-center; justify-content: center;">
            ${pulseHtml}
            <div style="
              background-color: ${markerBg};
              width: ${isSelected ? '32px' : '24px'};
              height: ${isSelected ? '32px' : '24px'};
              border-radius: 50%;
              border: 2px solid #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.35);
              color: white;
              font-size: ${isSelected ? '14px' : '10px'};
              font-weight: bold;
              z-index: ${isSelected ? 999 : 100};
              cursor: pointer;
            ">
              🎾
            </div>
          </div>
        `,
        iconSize: [isSelected ? 32 : 24, isSelected ? 32 : 24],
        iconAnchor: [isSelected ? 16 : 12, isSelected ? 16 : 12],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(group);

      const popupContent = `
        <div style="
          font-family: system-ui, -apple-system, sans-serif;
          width: 200px;
          padding: 8px;
          background: #ffffff;
          border-radius: 12px;
        ">
          <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 2px; line-height: 1.2;">
            ${court.name}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px; line-height: 1.3;">
            ${court.address}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; font-weight: 700; color: #059669; background: #ecfdf5; padding: 2px 6px; border-radius: 4px;">
              ${court.indoor ? 'Indoor' : 'Outdoor'} • ${court.fee}
            </span>
            <span style="font-size: 10px; font-weight: 800; color: #d97706;">
              ★ ${court.rating || 'New'}
            </span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        className: 'mini-map-custom-popup',
        offset: [0, -10]
      });

      marker.on('click', () => {
        if (onSelectCourt && court.id !== selectedCourt.id) {
          onSelectCourt(court);
        }
      });
    });

  }, [selectedCourt, allCourts, onSelectCourt]);

  const handleRecenter = () => {
    if (mapInstanceRef.current && selectedCourt.coordinates) {
      mapInstanceRef.current.flyTo(
        [selectedCourt.coordinates.lat, selectedCourt.coordinates.lng],
        15,
        { duration: 0.5 }
      );
    }
  };

  const handleOpenExternalMaps = () => {
    if (!selectedCourt.coordinates) return;
    const { lat, lng } = selectedCourt.coordinates;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-md relative group">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes mini-map-ping {
          75%, 100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        .mini-map-custom-popup .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }
        .mini-map-custom-popup .leaflet-popup-content {
          margin: 0;
        }
        .mini-map-custom-popup .leaflet-popup-tip-container {
          display: none;
        }
      ` }} />

      {/* Mini Map Bar Header */}
      <div className="px-3.5 py-2.5 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between text-xs text-white">
        <div className="flex items-center gap-1.5 font-bold">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span className="truncate max-w-[160px] sm:max-w-[220px]">{selectedCourt.name}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Layer style toggle */}
          <button
            onClick={() => {
              if (tileStyle === 'standard') setTileStyle('satellite');
              else if (tileStyle === 'satellite') setTileStyle('dark');
              else setTileStyle('standard');
            }}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-[10px] font-semibold flex items-center gap-1"
            title="Switch Map Tile View (Standard / Satellite / Dark)"
          >
            <Layers className="w-3 h-3 text-emerald-400" />
            <span className="capitalize text-[10px] hidden sm:inline">{tileStyle}</span>
          </button>

          {/* Recenter */}
          <button
            onClick={handleRecenter}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
            title="Recenter on Selected Court"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          {/* Open Google Maps Directions */}
          <button
            onClick={handleOpenExternalMaps}
            className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1 text-[10px] font-bold"
            title="Open in Google Maps / Directions"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden sm:inline">Directions</span>
          </button>
        </div>
      </div>

      {/* Map Element */}
      <div
        ref={mapContainerRef}
        style={{ height }}
        className="w-full bg-slate-950 relative z-0"
      />

      {/* Coordinate & Sub-info overlay */}
      <div className="px-3 py-1.5 bg-slate-950/90 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Lat: {selectedCourt.coordinates?.lat.toFixed(4)}, Lng: {selectedCourt.coordinates?.lng.toFixed(4)}</span>
        </div>
        <span className="text-slate-500 text-[10px]">Interactive Leaflet Map</span>
      </div>
    </div>
  );
}
