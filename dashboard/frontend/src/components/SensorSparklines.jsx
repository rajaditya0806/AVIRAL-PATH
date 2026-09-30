import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Activity, Radio } from 'lucide-react';

export default function SensorSparklines({ telemetry }) {
  const [sensorHistory, setSensorHistory] = useState([]);

  useEffect(() => {
    if (telemetry?.sensors) {
      setSensorHistory(prev => {
        const next = [
          ...prev,
          {
            time: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
            accel_x: telemetry.sensors.accel_x,
            accel_y: telemetry.sensors.accel_y,
            accel_z: telemetry.sensors.accel_z,
            gyro_z: telemetry.sensors.gyro_z
          }
        ];
        return next.slice(-20);
      });
    }
  }, [telemetry]);

  const currentSensors = telemetry?.sensors || { accel_x: 0, accel_y: 0, accel_z: 9.81, gyro_z: 0 };

  return (
    <div className="grid grid-cols-1 gap-2.5">
      
      {/* Accelerometer Chart */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-stone-700">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Accelerometer (X, Y, Z)
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="text-emerald-700 font-bold">X: {currentSensors.accel_x.toFixed(2)}</span>
            <span className="text-teal-700 font-bold">Y: {currentSensors.accel_y.toFixed(2)}</span>
          </div>
        </div>

        <div className="w-full h-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sensorHistory}>
              <defs>
                <linearGradient id="gradX" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <YAxis domain={[-3, 12]} hide />
              <Tooltip 
                contentStyle={{ background: '#FFFFFF', borderColor: '#E7E5E4', borderRadius: '8px', fontSize: '10px' }}
              />
              <Area type="monotone" dataKey="accel_x" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#gradX)" name="Accel X" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gyroscope Chart */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-stone-700">
            <Radio className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Gyroscope Yaw (Gyro Z)
            </span>
          </div>
          <div className="text-[10px] font-mono text-amber-700 font-bold">
            {currentSensors.gyro_z.toFixed(4)} rad/s
          </div>
        </div>

        <div className="w-full h-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sensorHistory}>
              <defs>
                <linearGradient id="gradGyro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D97706" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#D97706" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <YAxis domain={[-0.2, 0.2]} hide />
              <Tooltip 
                contentStyle={{ background: '#FFFFFF', borderColor: '#E7E5E4', borderRadius: '8px', fontSize: '10px' }}
              />
              <Area type="monotone" dataKey="gyro_z" stroke="#D97706" strokeWidth={2} fillOpacity={1} fill="url(#gradGyro)" name="Gyro Z" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
