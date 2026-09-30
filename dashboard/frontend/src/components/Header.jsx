import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  ShieldAlert,
  Navigation,
  Battery,
  Signal,
  Tv,
  Database
} from 'lucide-react';

export default function Header({ 
  telemetry, 
  isConnected, 
  onSendCommand,
  onOpenPresentation
}) {
  const killGps = telemetry?.kill_gps || false;
  const noiseLevel = telemetry?.noise_level || 1.0;
  const isPaused = telemetry?.playback_state === 'paused';
  const activeDataset = telemetry?.dataset;
  const availableDatasets = telemetry?.available_datasets || [];

  return (
    <div className="bg-white border-b border-stone-200/80 rounded-t-3xl pt-2 px-4 pb-3 shadow-xs sticky top-0 z-50">
      
      {/* Mobile Top Status Bar Simulation */}
      <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 mb-2 px-1">
        <span>09:41</span>
        <div className="w-16 h-3 bg-stone-900 rounded-full mx-auto"></div>
        <div className="flex items-center gap-1.5">
          <Signal className="w-3 h-3 text-stone-600" />
          <Wifi className="w-3 h-3 text-stone-600" />
          <Battery className="w-3.5 h-3.5 text-stone-700 fill-stone-700" />
        </div>
      </div>

      {/* Mobile App Branding & Status */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-100 border border-emerald-300/60 flex items-center justify-center text-emerald-700 shadow-xs">
            <Navigation className="w-5 h-5 fill-emerald-600/20" />
          </div>
          <div>
            <h1 className="text-base font-bold text-stone-800 leading-tight tracking-tight">
              Aviral Path
            </h1>
            <p className="text-[11px] font-medium text-stone-500 flex items-center gap-1">
              <span>Dead Reckoning INS</span>
              <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
              <span className="text-emerald-700 font-semibold">EKF v1.0</span>
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenPresentation}
            className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 border border-slate-800"
            title="Launch Fullscreen Presentation Mode"
          >
            <Tv className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>PRESENTATION</span>
          </button>

          <div className={`px-2 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 border ${
            isConnected 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>LIVE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span>OFFLINE</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dataset Selector Ribbon */}
      <div className="mb-1.5 bg-stone-100/90 p-1.5 rounded-xl border border-stone-200/80 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-stone-600 font-semibold shrink-0 text-[11px]">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>Dataset:</span>
        </div>

        <select 
          value={activeDataset?.id || ''} 
          onChange={(e) => onSendCommand('SET_DATASET', e.target.value)}
          className="bg-white border border-stone-300 text-stone-800 text-[11px] font-semibold rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-600 cursor-pointer flex-1 truncate"
        >
          {availableDatasets.map((ds) => (
            <option key={ds.id} value={ds.id}>
              {ds.name}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Launch Indian Dataset Chips */}
      <div className="mb-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
        {availableDatasets.map((ds) => {
          const isSelected = activeDataset?.id === ds.id;
          const shortLabel = ds.name.replace("IO-VNBD India: ", "").replace("IO-VNBD Benchmark: ", "");
          return (
            <button
              key={ds.id}
              onClick={() => onSendCommand('SET_DATASET', ds.id)}
              className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition-all border shrink-0 ${
                isSelected 
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs' 
                  : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
              }`}
            >
              {shortLabel}
            </button>
          );
        })}
      </div>

      {/* Mobile Quick Hackathon Controls Toolbar */}
      <div className="grid grid-cols-12 gap-2 pt-1 border-t border-stone-100">
        
        {/* Play / Pause / Reset Pill */}
        <div className="col-span-4 bg-stone-100/80 p-1 rounded-xl flex items-center justify-between border border-stone-200/60">
          <button
            onClick={() => onSendCommand('PLAYBACK', isPaused ? 'play' : 'pause')}
            className={`flex-1 py-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
              isPaused 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'bg-white text-stone-700 shadow-2xs'
            }`}
          >
            {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
            <span className="text-[11px]">{isPaused ? "Play" : "Pause"}</span>
          </button>
          
          <button
            onClick={() => onSendCommand('PLAYBACK', 'reset')}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
            title="Reset Route"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* IMU Noise Slider Pill */}
        <div className="col-span-4 bg-stone-100/80 px-2 py-1 rounded-xl flex items-center gap-1 border border-stone-200/60">
          <Sliders className="w-3 h-3 text-stone-500 shrink-0" />
          <input
            type="range"
            min="0.5"
            max="5.0"
            step="0.5"
            value={noiseLevel}
            onChange={(e) => onSendCommand('NOISE_LEVEL', parseFloat(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer h-1 bg-stone-300 rounded-lg"
          />
          <span className="text-[10px] font-mono font-bold text-stone-700 shrink-0">{noiseLevel}x</span>
        </div>

        {/* Kill GPS Button Pill */}
        <button
          onClick={() => onSendCommand('KILL_GPS', !killGps)}
          className={`col-span-4 py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95 border ${
            killGps
              ? 'bg-rose-600 text-white border-rose-700 shadow-xs animate-pulse'
              : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{killGps ? 'GNSS OFF' : 'KILL GPS'}</span>
        </button>

      </div>
    </div>
  );
}

