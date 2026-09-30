import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import MapView from './components/MapView';
import TelemetryCards from './components/TelemetryCards';
import SensorSparklines from './components/SensorSparklines';
import StatusBanner from './components/StatusBanner';
import BottomNav from './components/BottomNav';
import PresentationDashboard from './components/PresentationDashboard';
import { Smartphone, Monitor, Tv } from 'lucide-react';
import { BrowserSimulator } from './simulationEngine';

const WS_URL = 'ws://localhost:8000/ws/telemetry';

export default function App() {
  const [telemetry, setTelemetry] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const [isMobileFrame, setIsMobileFrame] = useState(true);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  
  const socketRef = useRef(null);
  const simulatorRef = useRef(new BrowserSimulator());
  const fallbackIntervalRef = useRef(null);

  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;

    const startFallbackSimulation = () => {
      if (!fallbackIntervalRef.current) {
        // Run standalone browser simulation every 300ms
        fallbackIntervalRef.current = setInterval(() => {
          if (simulatorRef.current) {
            const simulatedData = simulatorRef.current.updateSimulation();
            setTelemetry(simulatedData);
          }
        }, 300);
      }
    };

    const stopFallbackSimulation = () => {
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
        fallbackIntervalRef.current = null;
      }
    };

    const connect = () => {
      try {
        ws = new WebSocket(WS_URL);
        socketRef.current = ws;

        ws.onopen = () => {
          console.log("Connected to Telemetry WebSocket Server");
          setIsConnected(true);
          stopFallbackSimulation();
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setTelemetry(data);
          } catch (err) {
            console.error("Error parsing WebSocket JSON:", err);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          startFallbackSimulation();
          reconnectTimeout = setTimeout(connect, 5000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (err) {
        setIsConnected(false);
        startFallbackSimulation();
      }
    };

    // Start fallback simulation immediately, then try connecting WS
    startFallbackSimulation();
    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
      stopFallbackSimulation();
    };
  }, []);

  const handleSendCommand = useCallback((command, payload) => {
    // 1. Try sending over WebSocket if connected
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      if (typeof payload === 'object' && payload !== null) {
        socketRef.current.send(JSON.stringify({ command, ...payload }));
      } else {
        socketRef.current.send(JSON.stringify({ command, value: payload }));
      }
    }

    // 2. Always update local browser simulator for instant response & Vercel mode
    const sim = simulatorRef.current;
    if (!sim) return;

    const val = typeof payload === 'object' && payload !== null ? payload.value : payload;

    if (command === "KILL_GPS") {
      sim.killGps = Boolean(val);
    } else if (command === "NOISE_LEVEL") {
      sim.noiseLevel = parseFloat(val);
    } else if (command === "PLAYBACK") {
      if (val === "pause") sim.isPaused = true;
      else if (val === "play") sim.isPaused = false;
      else if (val === "reset") sim.reset();
    } else if (command === "SET_SPEED") {
      sim.playbackSpeed = Math.max(0.2, Math.min(10.0, parseFloat(val)));
    } else if (command === "SET_DATASET") {
      sim.setDataset(String(val));
    } else if (command === "UPLOAD_DATASET" && typeof payload === 'object') {
      sim.uploadCustomDataset(payload.name, payload.waypoints, payload.speed || 12.0);
    }

    // Immediately trigger telemetry update
    setTelemetry(sim.updateSimulation());
  }, []);

  if (isPresentationMode) {
    return (
      <PresentationDashboard
        telemetry={telemetry}
        onSendCommand={handleSendCommand}
        onClosePresentation={() => setIsPresentationMode(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#EFECE6] text-stone-800 flex flex-col items-center justify-center p-2 sm:p-4 font-sans selection:bg-emerald-200">
      
      {/* Viewport Mode & Presentation Switcher Toolbar */}
      <div className="mb-2 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-stone-300 shadow-2xs text-xs">
        <button
          onClick={() => setIsMobileFrame(true)}
          className={`px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 transition-all ${
            isMobileFrame ? 'bg-emerald-600 text-white shadow-2xs' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile App Frame</span>
        </button>
        <button
          onClick={() => setIsMobileFrame(false)}
          className={`px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 transition-all ${
            !isMobileFrame ? 'bg-emerald-600 text-white shadow-2xs' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Full Screen</span>
        </button>
        <div className="w-px h-4 bg-stone-300 mx-1"></div>
        <button
          onClick={() => setIsPresentationMode(true)}
          className="px-3 py-1 rounded-full font-bold bg-slate-900 text-emerald-400 hover:bg-slate-800 flex items-center gap-1.5 transition-all shadow-xs"
        >
          <Tv className="w-3.5 h-3.5 animate-pulse" />
          <span>Dashboard Presentation</span>
        </button>
      </div>

      {/* Main Mobile Dashboard Container */}
      <div className={`w-full bg-[#FAF8F5] transition-all flex flex-col justify-between ${
        isMobileFrame 
          ? 'max-w-[430px] rounded-[2.5rem] border-[6px] border-stone-800 shadow-2xl min-h-[840px] my-2' 
          : 'max-w-4xl rounded-3xl border border-stone-300 shadow-xl min-h-[800px]'
      }`}>
        
        {/* Mobile Header Bar */}
        <Header 
          telemetry={telemetry} 
          isConnected={true} 
          onSendCommand={handleSendCommand}
          onOpenPresentation={() => setIsPresentationMode(true)}
        />

        {/* Scrollable Main Content Canvas */}
        <div className="p-3 flex-1 flex flex-col gap-3 overflow-y-auto max-h-[670px]">
          
          {/* Status Notification Banner */}
          <StatusBanner telemetry={telemetry} />

          {/* Interactive OpenStreetMap View */}
          <div className="h-[290px] shrink-0">
            <MapView telemetry={telemetry} />
          </div>

          {/* Telemetry Metrics Grid */}
          <TelemetryCards telemetry={telemetry} />

          {/* Sensor Graphs */}
          <SensorSparklines telemetry={telemetry} />

          {/* Mobile EKF Engine Info Pill */}
          <div className="bg-stone-100/90 border border-stone-200/80 p-3 rounded-2xl text-[11px] text-stone-600 font-mono">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-emerald-800">Aviral Path Engine Specs</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-sans font-bold">100 Hz IO-VNBD</span>
            </div>
            <p className="text-[10px] text-stone-500">
              Inertial & Odometry Vehicle Navigation Benchmark Dataset (IO-VNBD) stream with real-time OpenStreetMap fusion.
            </p>
          </div>

        </div>

        {/* Mobile App Bottom Navigation Bar */}
        <BottomNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onOpenPresentation={() => setIsPresentationMode(true)}
        />

      </div>

    </div>
  );
}
