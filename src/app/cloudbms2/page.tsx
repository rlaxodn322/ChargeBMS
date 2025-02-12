'use client';
import { useState, useEffect } from 'react';

type Module = {
  charge: number;
  temperature: number;
  isCharging: boolean;
  expectedTime: number | null;
  kw: number;
  voltage: number;
  capacity: number; // 추가: 배터리 용량 (Wh)
};

export default function ChargingDashboard() {
  const [modules, setModules] = useState<Module[]>(
    Array(9)
      .fill(undefined)
      .map(() => ({
        charge: 0,
        temperature: 25,
        isCharging: false,
        expectedTime: null,
        kw: 7,
        voltage: 400,
        capacity: 10000, // 기본 배터리 용량 (Wh)
      }))
  );

  const calculateExpectedTime = (module: Module): number => {
    const A = (module.kw * 1000) / module.voltage; // 암페어 계산 (KW -> W 변환)
    const remainingWh = (module.capacity * (100 - module.charge)) / 100;
    return (remainingWh / (A * module.voltage)) * 3600; // 초 단위 변환
  };

  const startCharging = (index: number) => {
    setModules((prevModules) => {
      const newModules = [...prevModules];
      newModules[index].isCharging = true;
      newModules[index].expectedTime = calculateExpectedTime(newModules[index]);
      return newModules;
    });
  };

  const stopCharging = (index: number) => {
    setModules((prevModules) => {
      const newModules = [...prevModules];
      newModules[index].isCharging = false;
      return newModules;
    });
  };

  const updateModule = (index: number, key: keyof Module, value: number) => {
    setModules((prevModules) => {
      const newModules = [...prevModules];
      newModules[index][key] = value;
      if (key === 'kw' || key === 'voltage' || key === 'capacity') {
        newModules[index].expectedTime = calculateExpectedTime(
          newModules[index]
        );
      }
      return newModules;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setModules((prevModules) =>
        prevModules.map((module) => {
          if (module.isCharging && module.charge < 100) {
            return {
              ...module,
              charge: Math.min(100, module.charge + 1),
              expectedTime: calculateExpectedTime(module),
            };
          }
          return module;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 bg-gray-900 text-white">
      <h1 className="text-xl font-bold mb-4">Charging Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        {modules.map((module, index) => (
          <div key={index} className="p-4 bg-gray-800 rounded-lg">
            <h2 className="text-lg font-semibold">Module {index + 1}</h2>
            <p>Charge: {module.charge}%</p>
            <p>Temperature: {module.temperature}°C</p>
            <p>
              Expected Time:{' '}
              {module.expectedTime
                ? (module.expectedTime / 60).toFixed(2)
                : '-'}{' '}
              min
            </p>
            <label>KW</label>
            <input
              type="number"
              value={module.kw}
              onChange={(e) =>
                updateModule(index, 'kw', Number(e.target.value))
              }
              className="bg-gray-700 text-white p-1 rounded mb-2 w-full"
            />
            <label>Voltage</label>
            <input
              type="number"
              value={module.voltage}
              onChange={(e) =>
                updateModule(index, 'voltage', Number(e.target.value))
              }
              className="bg-gray-700 text-white p-1 rounded mb-2 w-full"
            />
            <label>Battery Capacity (Wh)</label>
            <input
              type="number"
              value={module.capacity}
              onChange={(e) =>
                updateModule(index, 'capacity', Number(e.target.value))
              }
              className="bg-gray-700 text-white p-1 rounded mb-2 w-full"
            />
            <button
              onClick={() => startCharging(index)}
              className="bg-green-600 px-3 py-1 rounded mr-2"
            >
              Start
            </button>
            <button
              onClick={() => stopCharging(index)}
              className="bg-red-600 px-3 py-1 rounded"
            >
              Stop
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
