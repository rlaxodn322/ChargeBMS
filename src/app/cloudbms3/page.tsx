'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// 배터리 및 충전기 타입 정의
type Module = {
  charge: number;
  temperature: number;
  isCharging: boolean;
  kw: number;
  voltage: number;
  current: number;
  expectedTime: number | null;
};

export default function ChargingDashboard() {
  const [modules, setModules] = useState<Module[]>(
    Array(6)
      .fill(undefined)
      .map(() => ({
        charge: 0,
        temperature: 25,
        isCharging: false,
        kw: 7,
        voltage: 400,
        current: 0,
        expectedTime: null,
      }))
  );

  // 전류(A) 계산 및 예상 충전 시간
  const calculateCharging = (module: Module) => {
    const current = (module.kw * 1000) / module.voltage;
    const chargeNeeded = 100 - module.charge;
    const chargePerSecond = (module.kw * 1000) / (module.voltage * 3600);
    const expectedTime = chargeNeeded / chargePerSecond;
    return { current, expectedTime };
  };

  // 충전 토글
  const toggleCharging = (index: number) => {
    setModules((prevModules) => {
      const newModules = [...prevModules];
      // eslint-disable-next-line @next/next/no-assign-module-variable
      const module = newModules[index];

      if (module.isCharging) {
        newModules[index] = {
          ...module,
          isCharging: false,
          expectedTime: null,
          current: 0,
        };
      } else {
        const { current, expectedTime } = calculateCharging(module);
        newModules[index] = {
          ...module,
          isCharging: true,
          current,
          expectedTime,
        };
      }
      return newModules;
    });
  };

  // 충전 및 온도 증가
  useEffect(() => {
    const interval = setInterval(() => {
      setModules((prevModules) =>
        prevModules.map((module) => {
          if (module.isCharging && module.charge < 100) {
            const newCharge = Math.min(module.charge + 1, 100);
            const newTemp = module.temperature + Math.random() * 1.5;
            return { ...module, charge: newCharge, temperature: newTemp };
          } else if (module.charge >= 100) {
            return {
              ...module,
              isCharging: false,
              expectedTime: null,
              current: 0,
            };
          }
          return module;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Charging Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        {modules.map((module, index) => (
          <div key={index} className="p-4 bg-gray-800 rounded-lg text-center">
            <h2 className="text-lg font-semibold">Module {index + 1}</h2>
            <div className="relative w-20 h-40 mx-auto border-4 border-gray-300 rounded-md overflow-hidden bg-black">
              <motion.div
                className={`absolute bottom-0 w-full ${
                  module.temperature > 50 ? 'bg-red-500' : 'bg-green-500'
                }`}
                animate={{ height: `${module.charge}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p>Charge: {module.charge}%</p>
            <p>Temp: {module.temperature.toFixed(1)}°C</p>
            <p>Current: {module.current.toFixed(2)} A</p>
            <p>
              Time Left:{' '}
              {module.expectedTime
                ? (module.expectedTime / 60).toFixed(2)
                : '-'}{' '}
              min
            </p>
            <button
              onClick={() => toggleCharging(index)}
              className={`mt-2 px-3 py-1 rounded ${
                module.isCharging ? 'bg-red-600' : 'bg-green-600'
              }`}
            >
              {module.isCharging ? 'Stop' : 'Start'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
