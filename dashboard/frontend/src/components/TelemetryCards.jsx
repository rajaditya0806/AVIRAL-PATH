import React from 'react';
import { Gauge, Clock, Flag, Compass, Cpu } from 'lucide-react';

export default function TelemetryCards({ telemetry }) {
  const speedMs = telemetry?.speed_ms ?? 0.0;
  const speedKmh = telemetry?.speed_kmh ?? 0.0;
  const etaMin = telemetry?.eta_min ?? 0.0;
  const progressPct = telemetry?.progress_pct ?? 0.0;
  const confidence = telemetry?.ml_confidence ?? 0.95;
  const confidencePct = Math.round(confidence * 100);
  const driftMeters = telemetry?.drift_meters ?? 0.0;
  const killGps = telemetry?.kill_gps ?? false;
  const secondsWithoutGps = telemetry?.seconds_without_gps ?? 0.0;
  const headingDeg = telemetry?.heading_deg ?? 0;

  const getConfidenceBadge = (pct) => {
    if (pct >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (pct >= 65) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <div className="grid grid-cols-2 gap-2.5">
      
      {/* 1. Speed Metric Card */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-stone-500 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider">Speed</span>
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Gauge className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold font-mono text-stone-900">{speedMs.toFixed(1)}</span>
            <span className="text-xs font-semibold text-emerald-700">m/s</span>
          </div>
          <div className="mt-0.5 flex items-center justify-between text-[11px] text-stone-500 font-mono">
            <span>{speedKmh.toFixed(1)} km/h</span>
            <span className="flex items-center gap-0.5">
              <Compass className="w-3 h-3 text-emerald-600" />
              {headingDeg}°
            </span>
          </div>
        </div>
      </div>

      {/* 2. ETA Card */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-stone-500 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider">ETA</span>
          <div className="p-1.5 rounded-lg bg-stone-100 text-stone-700">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold font-mono text-stone-900">{etaMin.toFixed(1)}</span>
            <span className="text-xs font-semibold text-stone-600">min</span>
          </div>
          <div className="mt-0.5 text-[10px] text-stone-500 truncate">
            Lodhi Garden
          </div>
        </div>
      </div>

      {/* 3. Route Progress Card */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-stone-500 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider">Progress</span>
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Flag className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold font-mono text-stone-900">{progressPct.toFixed(0)}</span>
            <span className="text-xs font-semibold text-emerald-700">%</span>
          </div>
          <div className="mt-1.5 w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 4. AI Confidence Card */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-stone-500 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider">AI Score</span>
          <div className={`p-1.5 rounded-lg ${killGps ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
            <Cpu className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-mono text-emerald-700">
              {confidencePct}%
            </span>
            {killGps && (
              <span className="text-[9px] font-mono font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                +{secondsWithoutGps.toFixed(0)}s
              </span>
            )}
          </div>
          <div className="mt-0.5 text-[10px] text-stone-500 font-mono flex justify-between">
            <span>Drift:</span>
            <span className="font-bold text-stone-800">{driftMeters.toFixed(2)}m</span>
          </div>
        </div>
      </div>

    </div>
  );
}
