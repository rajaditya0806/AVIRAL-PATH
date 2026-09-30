import React from 'react';
import { Navigation, Gauge, Activity, Tv } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, onOpenPresentation }) {
  const navItems = [
    { id: 'map', label: 'Map View', icon: Navigation },
    { id: 'telemetry', label: 'Metrics', icon: Gauge },
    { id: 'sensors', label: 'Sensors', icon: Activity },
    { id: 'presentation', label: 'Presentation', icon: Tv },
  ];

  return (
    <div className="bg-white border-t border-stone-200/80 rounded-b-3xl px-3 py-2 flex items-center justify-around sticky bottom-0 shadow-lg z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'presentation') {
                onOpenPresentation();
              } else {
                setActiveTab(item.id);
              }
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all active:scale-95 ${
              isActive || item.id === 'presentation'
                ? 'text-emerald-700 bg-emerald-50 font-bold' 
                : 'text-stone-500 hover:text-stone-800 font-semibold'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
