import React, { useState, useRef } from 'react';
import MapView from './MapView';
import SensorSparklines from './SensorSparklines';
import TelemetryCards from './TelemetryCards';
import StatusBanner from './StatusBanner';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  ShieldAlert, 
  Upload, 
  Download, 
  Sparkles, 
  Compass, 
  Layers, 
  Tv, 
  X, 
  FileSpreadsheet,
  CheckCircle2,
  Gauge,
  Radio,
  Cpu
} from 'lucide-react';

export default function PresentationDashboard({ 
  telemetry, 
  onSendCommand, 
  onClosePresentation 
}) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);

  const activeDataset = telemetry?.dataset;
  const availableDatasets = telemetry?.available_datasets || [];
  const killGps = telemetry?.kill_gps || false;
  const isPaused = telemetry?.playback_state === 'paused';
  const playbackSpeed = telemetry?.playback_speed || 1.0;
  const noiseLevel = telemetry?.noise_level || 1.0;

  // Handle CSV / JSON dataset parsing
  const processUploadedFile = (file) => {
    if (!file) return;
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        let waypoints = [];

        if (file.name.endsWith('.json')) {
          const json = JSON.parse(text);
          const rawList = Array.isArray(json) ? json : (json.waypoints || json.data || []);
          waypoints = rawList.map(pt => [
            parseFloat(pt.lat || pt.latitude), 
            parseFloat(pt.lng || pt.longitude || pt.lon)
          ]).filter(pt => !isNaN(pt[0]) && !isNaN(pt[1]));
        } else {
          // Assume CSV
          const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
          if (lines.length < 2) throw new Error("CSV file is empty or missing data rows");

          const header = lines[0].toLowerCase().split(',');
          let latIdx = header.findIndex(h => h.includes('lat'));
          let lngIdx = header.findIndex(h => h.includes('lng') || h.includes('lon'));

          if (latIdx === -1) latIdx = 1;
          if (lngIdx === -1) lngIdx = 2;

          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (cols.length > Math.max(latIdx, lngIdx)) {
              const lat = parseFloat(cols[latIdx]);
              const lng = parseFloat(cols[lngIdx]);
              if (!isNaN(lat) && !isNaN(lng)) {
                waypoints.push([lat, lng]);
              }
            }
          }
        }

        if (waypoints.length < 2) {
          throw new Error("Could not parse valid Lat/Lng waypoints from file");
        }

        const name = customName.trim() || file.name.replace(/\.[^/.]+$/, "");
        onSendCommand('UPLOAD_DATASET', {
          name: name,
          waypoints: waypoints,
          speed: 14.0
        });

        setUploadStatus({ success: true, message: `Loaded ${waypoints.length} points from ${file.name}` });
        setTimeout(() => {
          setShowUploadModal(false);
          setUploadStatus(null);
        }, 1200);

      } catch (err) {
        console.error("Dataset Parsing Error:", err);
        setUploadStatus({ success: false, message: err.message || "Failed to parse file" });
      }
    };

    reader.readAsText(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  // Export trajectory telemetry to CSV download
  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Timestamp,Dataset,GNSS_Status,AI_Lat,AI_Lng,Raw_Lat,Raw_Lng,Speed_kmh,Heading_deg,Drift_meters,Confidence\n" +
      `${Date.now()},${activeDataset?.name || 'IO-VNBD'},${telemetry?.gnss_status},${telemetry?.ai_estimated?.lat},${telemetry?.ai_estimated?.lng},${telemetry?.raw_gnss?.lat},${telemetry?.raw_gnss?.lng},${telemetry?.speed_kmh},${telemetry?.heading_deg},${telemetry?.drift_meters},${telemetry?.ml_confidence}`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `telemetry_export_${activeDataset?.id || 'iovnbd'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[5000] bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      
      {/* Top Presentation Navigation Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between shadow-lg backdrop-blur-md">
        
        {/* Left Branding & Live Dataset Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Tv className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>Aviral Path</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  DASHBOARD PRESENTATION MODE
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <span className="text-emerald-400 font-bold">{activeDataset?.name || 'IO-VNBD Benchmark'}</span>
              <span>•</span>
              <span>{activeDataset?.location || 'UK / Global Track'}</span>
            </p>
          </div>
        </div>

        {/* Center Live Dataset Selector */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 px-2 uppercase tracking-wider">Dataset:</span>
          <select 
            value={activeDataset?.id || ''} 
            onChange={(e) => onSendCommand('SET_DATASET', e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-100 font-semibold text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {availableDatasets.map((ds) => (
              <option key={ds.id} value={ds.id}>
                {ds.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Dataset CSV</span>
          </button>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
            title="Export Trajectory Telemetry"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={onClosePresentation}
            className="p-2 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-700 hover:border-rose-800/80 transition-all"
            title="Exit Presentation Mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Launch Indian Dataset Chips Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs shrink-0 scrollbar-none">
        <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Featured Indian Benchmarks:</span>
        </span>

        {availableDatasets.map((ds) => {
          const isSelected = activeDataset?.id === ds.id;
          const shortName = ds.name.replace("IO-VNBD India: ", "").replace("IO-VNBD Benchmark: ", "");
          return (
            <button
              key={ds.id}
              onClick={() => onSendCommand('SET_DATASET', ds.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 active:scale-95 text-xs border ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 border-emerald-400'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-700'
              }`}
            >
              <span>{shortName}</span>
            </button>
          );
        })}
      </div>

      {/* Main Presentation Layout Grid */}
      <div className="flex-1 grid grid-cols-12 gap-3 p-3 overflow-hidden bg-slate-950">
        
        {/* Left Column: Full height Interactive OpenStreetMap View */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-9 flex flex-col gap-3 h-full overflow-hidden">
          
          {/* Status Alert Ribbon */}
          <StatusBanner telemetry={telemetry} />

          {/* Interactive OpenStreetMap Container */}
          <div className="flex-1 w-full relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl min-h-[350px]">
            <MapView telemetry={telemetry} />
          </div>

          {/* Presentation Control Dock Toolbar */}
          <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shadow-xl">
            
            {/* Playback Controls */}
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => onSendCommand('PLAYBACK', isPaused ? 'play' : 'pause')}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                  isPaused 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' 
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                <span>{isPaused ? "RESUME" : "PAUSE"}</span>
              </button>

              <button
                onClick={() => onSendCommand('PLAYBACK', 'reset')}
                className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-all"
                title="Reset Route"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Playback Speed Multiplier */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px] mr-1">Speed:</span>
              {[0.5, 1.0, 2.0, 5.0, 10.0].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onSendCommand('SET_SPEED', spd)}
                  className={`px-2 py-1 rounded-lg font-mono font-bold transition-all ${
                    playbackSpeed === spd 
                      ? 'bg-emerald-500 text-slate-950 shadow-md' 
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* IMU Drift / Noise Level Slider */}
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <Sliders className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">IMU Noise:</span>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={noiseLevel}
                onChange={(e) => onSendCommand('NOISE_LEVEL', parseFloat(e.target.value))}
                className="w-24 accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="font-mono font-bold text-emerald-400 text-xs">{noiseLevel}x</span>
            </div>

            {/* Emergency GNSS Outage / Blackout Simulation Trigger */}
            <button
              onClick={() => onSendCommand('KILL_GPS', !killGps)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 border transition-all active:scale-95 shadow-md ${
                killGps
                  ? 'bg-rose-600 text-white border-rose-500 shadow-rose-900/50 animate-pulse'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{killGps ? 'GNSS BLACKOUT (DEAD RECKONING ON)' : 'SIMULATE TUNNEL OUTAGE'}</span>
            </button>

          </div>

        </div>

        {/* Right Column: Telemetry Cards & Live Graphs */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col gap-3 overflow-y-auto">
          
          {/* IO-VNBD Live Dataset Info Card */}
          <div className="bg-slate-900/90 border border-slate-800/90 p-4 rounded-2xl shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dataset Specs</span>
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                100 Hz Telemetry
              </span>
            </div>
            
            <h2 className="text-sm font-bold text-white mb-1">
              {activeDataset?.name || 'IO-VNBD Benchmark Dataset'}
            </h2>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              {activeDataset?.description || 'Inertial & Odometry Vehicle Navigation Benchmark Dataset with smartphone & vehicle sensors.'}
            </p>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono grid grid-cols-2 gap-2 text-slate-300">
              <div>
                <span className="text-slate-500 block">Status:</span>
                <span className="font-bold text-emerald-400">{telemetry?.gnss_status || 'ACTIVE'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Heading:</span>
                <span className="font-bold text-amber-400">{telemetry?.heading_deg || 0}°</span>
              </div>
            </div>
          </div>

          {/* Telemetry Metrics */}
          <TelemetryCards telemetry={telemetry} />

          {/* Real-time Sensor Waveforms */}
          <SensorSparklines telemetry={telemetry} />

        </div>

      </div>

      {/* Drag & Drop Upload Custom IO-VNBD Dataset Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[6000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => {
                setShowUploadModal(false);
                setUploadStatus(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Upload IO-VNBD Dataset</h3>
                <p className="text-xs text-slate-400">Drag & drop CSV or JSON trajectory files</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Dataset Name (Optional):</label>
              <input
                type="text"
                placeholder="e.g., IO-VNBD Test Run 04"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-xl p-2.5 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragActive 
                  ? 'border-emerald-500 bg-emerald-500/10' 
                  : 'border-slate-700 bg-slate-950/60 hover:border-slate-500 hover:bg-slate-950'
              }`}
            >
              <Upload className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-200">
                Drop your IO-VNBD CSV / JSON file here
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports Lat, Lng, Accel X/Y/Z, Gyro Z column formats
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={(e) => processUploadedFile(e.target.files[0])}
                className="hidden"
              />
            </div>

            {/* Quick Load Sample Button */}
            <div className="mt-3 flex justify-between items-center text-xs">
              <span className="text-slate-400">Need a sample dataset file?</span>
              <a
                href="/io_vnbd_sample_dataset.csv"
                download
                className="text-emerald-400 hover:text-emerald-300 font-bold underline"
              >
                Download Sample CSV
              </a>
            </div>

            {uploadStatus && (
              <div className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                uploadStatus.success ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {uploadStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <ShieldAlert className="w-4 h-4 shrink-0" />}
                <span>{uploadStatus.message}</span>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
