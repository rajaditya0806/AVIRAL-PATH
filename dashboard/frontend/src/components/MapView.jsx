import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, MapPin, Layers, Sparkles } from 'lucide-react';

// Custom Vehicle DivIcon generator for light/dark themes
const createVehicleIcon = (headingDeg, isGpsKilled, isDarkMap) => {
  const colorHex = isGpsKilled ? '#f59e0b' : '#10b981';
  return L.divIcon({
    className: 'vehicle-marker-wrapper',
    html: `
      <div style="transform: rotate(${headingDeg}deg);" class="vehicle-marker-icon relative flex items-center justify-center w-9 h-9">
        <div class="absolute inset-0 rounded-full animate-ping opacity-30" style="background-color: ${colorHex};"></div>
        <div class="relative z-10 w-8 h-8 rounded-full ${isDarkMap ? 'bg-slate-900 border-emerald-400' : 'bg-white border-stone-800'} border-2 flex items-center justify-center shadow-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${colorHex}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2" fill="${colorHex}" fill-opacity="0.3"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

const gnssMarkerIcon = L.divIcon({
  className: 'gnss-marker-wrapper',
  html: `
    <div class="relative flex items-center justify-center w-5 h-5">
      <div class="w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white shadow-sm animate-pulse"></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function MapController({ center, autoFollow, tileStyle }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    if (center && center[0] && center[1]) {
      if (autoFollow) {
        map.panTo(center, { animate: true, duration: 0.5 });
      }
    }
    return () => clearTimeout(timer);
  }, [center, autoFollow, tileStyle, map]);
  return null;
}

const TILE_LAYERS = {
  osm: {
    name: 'OpenStreetMap Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  openai_dark: {
    name: 'OpenAI Tech Dark Map',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
  },
  carto_light: {
    name: 'OpenStreetMap Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
  },
  esri: {
    name: 'Esri Street Map',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, NAVTEQ'
  },
  satellite: {
    name: 'Satellite View',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Source: Esri, Maxar, Earthstar Geographics'
  }
};

export default function MapView({ telemetry }) {
  const [gnssHistory, setGnssHistory] = useState([]);
  const [aiHistory, setAiHistory] = useState([]);
  const [autoFollow, setAutoFollow] = useState(true);
  const [tileStyle, setTileStyle] = useState('osm');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [currentDatasetId, setCurrentDatasetId] = useState(null);

  const rawGnss = telemetry?.raw_gnss;
  const aiEstimated = telemetry?.ai_estimated;
  const headingDeg = telemetry?.heading_deg || 0;
  const killGps = telemetry?.kill_gps || false;
  const datasetInfo = telemetry?.dataset;

  // Reset trajectory history when switching datasets
  useEffect(() => {
    if (datasetInfo?.id && datasetInfo.id !== currentDatasetId) {
      setCurrentDatasetId(datasetInfo.id);
      setGnssHistory([]);
      setAiHistory([]);
    }
  }, [datasetInfo, currentDatasetId]);

  useEffect(() => {
    if (aiEstimated && aiEstimated.lat && aiEstimated.lng) {
      setAiHistory(prev => {
        const next = [...prev, [aiEstimated.lat, aiEstimated.lng]];
        return next.slice(-200);
      });
    }

    if (!killGps && rawGnss && rawGnss.lat && rawGnss.lng) {
      setGnssHistory(prev => {
        const next = [...prev, [rawGnss.lat, rawGnss.lng]];
        return next.slice(-200);
      });
    }
  }, [telemetry, killGps, rawGnss, aiEstimated]);

  const currentCenter = aiEstimated?.lat && aiEstimated?.lng 
    ? [aiEstimated.lat, aiEstimated.lng] 
    : [28.6315, 77.2167];

  const activeTile = TILE_LAYERS[tileStyle] || TILE_LAYERS.osm;
  const isDarkMap = tileStyle === 'openai_dark';

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-stone-300 shadow-md bg-stone-100 min-h-[280px]">
      <MapContainer
        center={currentCenter}
        zoom={16}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          key={tileStyle}
          url={activeTile.url}
          attribution={activeTile.attribution}
          maxZoom={19}
        />

        <MapController center={currentCenter} autoFollow={autoFollow} tileStyle={tileStyle} />

        {/* 1. Red Dashed Line: Raw Actual GNSS Track (SHOW ONLY WHEN GNSS IS ON) */}
        {!killGps && gnssHistory.length > 1 && (
          <Polyline
            positions={gnssHistory}
            pathOptions={{
              color: '#ef4444',
              weight: 3.5,
              dashArray: '6, 6',
              opacity: 0.85
            }}
          />
        )}

        {/* 2. Emerald / Amber Solid Line: AI Estimated EKF Track (ALWAYS SHOWN) */}
        {aiHistory.length > 1 && (
          <Polyline
            positions={aiHistory}
            pathOptions={{
              color: killGps ? '#f59e0b' : '#10b981',
              weight: 4.5,
              opacity: 0.95
            }}
          />
        )}

        {/* Raw GNSS Marker (SHOW ONLY WHEN GNSS IS ON) */}
        {!killGps && rawGnss?.lat && rawGnss?.lng && (
          <Marker position={[rawGnss.lat, rawGnss.lng]} icon={gnssMarkerIcon}>
            <Popup>
              <div className="p-1 text-xs font-mono">
                <p className="font-bold text-rose-600">ACTUAL GNSS FEED</p>
                <p>Lat: {rawGnss.lat}</p>
                <p>Lng: {rawGnss.lng}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* AI Vehicle Marker (ALWAYS SHOWN) */}
        {aiEstimated?.lat && aiEstimated?.lng && (
          <Marker 
            position={[aiEstimated.lat, aiEstimated.lng]} 
            icon={createVehicleIcon(headingDeg, killGps, isDarkMap)}
          >
            <Popup>
              <div className="p-1 text-xs font-mono">
                <p className="font-bold text-emerald-600">AI DEAD RECKONING</p>
                <p>Heading: {headingDeg}°</p>
                <p>Speed: {telemetry?.speed_kmh} km/h</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Trajectory Legend Overlay */}
      <div className={`absolute top-3 left-3 z-[400] backdrop-blur-md px-3 py-2 rounded-xl border flex flex-col gap-1 shadow-md text-[11px] ${
        isDarkMap ? 'bg-slate-900/90 border-slate-700/80 text-white' : 'bg-white/90 border-stone-200/80 text-stone-800'
      }`}>
        <div className="flex items-center gap-2 font-medium">
          <span className={`w-3.5 h-1 rounded-full ${killGps ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
          <span className={killGps ? 'text-amber-400 font-bold' : 'text-emerald-400 font-semibold'}>
            {killGps ? 'AI Reckoning (GPS-Denied)' : 'AI Estimated Path'}
          </span>
        </div>

        {!killGps && (
          <div className="flex items-center gap-2 font-medium">
            <span className="w-3.5 h-0.5 border-t-2 border-dashed border-rose-500"></span>
            <span className="text-rose-500 font-medium">
              Actual GNSS Track
            </span>
          </div>
        )}
      </div>

      {/* Map Layer Switcher Button & Menu */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col items-end gap-1">
        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          className={`p-2 backdrop-blur-md rounded-xl border shadow-sm flex items-center gap-1.5 text-[11px] font-semibold transition-all ${
            isDarkMap 
              ? 'bg-slate-900/90 border-slate-700 text-slate-100 hover:bg-slate-800' 
              : 'bg-white/90 border-stone-200 text-stone-800 hover:bg-stone-100'
          }`}
          title="Switch Map Style"
        >
          {tileStyle === 'openai_dark' ? <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> : <Layers className="w-3.5 h-3.5 text-emerald-600" />}
          <span className="capitalize">{TILE_LAYERS[tileStyle]?.name || 'OpenStreetMap'}</span>
        </button>

        {showLayerMenu && (
          <div className={`p-1.5 rounded-xl border shadow-xl flex flex-col gap-1 text-[11px] min-w-[150px] backdrop-blur-md ${
            isDarkMap ? 'bg-slate-900/95 border-slate-700 text-slate-200' : 'bg-white/95 border-stone-200 text-stone-800'
          }`}>
            {Object.keys(TILE_LAYERS).map((key) => (
              <button
                key={key}
                onClick={() => {
                  setTileStyle(key);
                  setShowLayerMenu(false);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-left transition-all font-medium flex items-center justify-between ${
                  tileStyle === key 
                    ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40' 
                    : 'hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <span>{TILE_LAYERS[key].name}</span>
                {key === 'openai_dark' && <Sparkles className="w-3 h-3 text-emerald-400" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Auto-Center Map Button */}
      <button
        onClick={() => setAutoFollow(!autoFollow)}
        className={`absolute bottom-3 right-3 z-[400] p-2.5 rounded-xl border transition-all shadow-md ${
          autoFollow 
            ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-600/30' 
            : isDarkMap ? 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
        }`}
        title="Recenter Map"
      >
        <Crosshair className="w-4 h-4" />
      </button>

      {/* Location / Dataset Landmark Badge */}
      <div className={`absolute bottom-3 left-3 z-[400] backdrop-blur-md px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-[10px] font-medium shadow-md ${
        isDarkMap ? 'bg-slate-900/90 border-slate-700/80 text-slate-200' : 'bg-white/90 border-stone-200/80 text-stone-700'
      }`}>
        <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
        <span className="truncate max-w-[200px]">{datasetInfo?.location || 'IO-VNBD Benchmark Track'}</span>
      </div>
    </div>
  );
}
