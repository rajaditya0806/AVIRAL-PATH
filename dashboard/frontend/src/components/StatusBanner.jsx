import React from 'react';
import { ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';

export default function StatusBanner({ telemetry }) {
  const killGps = telemetry?.kill_gps || false;
  const secondsWithoutGps = telemetry?.seconds_without_gps || 0.0;
  const driftMeters = telemetry?.drift_meters || 0.0;
  const confidencePct = Math.round((telemetry?.ml_confidence || 0.95) * 100);

  if (!killGps) {
    return (
      <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-900 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <div>
            <span className="font-bold block text-emerald-900 leading-tight">GNSS + INS Active</span>
            <span className="text-[10px] text-emerald-700/80 font-medium">Standard Navigation Mode</span>
          </div>
        </div>
        <div className="text-right font-mono text-[11px]">
          <span className="text-stone-500 block text-[10px]">Confidence</span>
          <span className="font-bold text-emerald-700">{confidencePct}%</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-rose-50 border border-rose-300 rounded-2xl p-3 flex items-center justify-between text-xs text-rose-900 shadow-xs animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping shrink-0"></div>
        <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
        <div>
          <span className="font-bold block text-rose-950 leading-tight">GNSS Blocked ➔ AI Dead Reckoning</span>
          <span className="text-[10px] text-rose-700 font-semibold font-mono">+{secondsWithoutGps.toFixed(1)}s INS Active</span>
        </div>
      </div>
      <div className="text-right font-mono text-[11px]">
        <span className="text-rose-700 block text-[10px]">Est. Drift</span>
        <span className="font-bold text-rose-900">{driftMeters.toFixed(2)} m</span>
      </div>
    </div>
  );
}
