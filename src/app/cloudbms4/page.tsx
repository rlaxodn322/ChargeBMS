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
  overheatingTime: number; // 100℃ 이상 유지된 시간
};

export default function ChargingDashboard() {
  const [modules, setModules] = useState<Module[]>(
    Array(3)
      .fill(undefined)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map((_, i) => ({
        charge: 0,
        temperature: 25,
        isCharging: false,
        kw: 7,
        voltage: 400,
        current: 0,
        expectedTime: null,
        overheatingTime: 0, // 과열 유지 시간
      }))
  );

  // 전류(A) 계산 및 예상 충전 시간
  const calculateCharging = (module: Module) => {
    const current = (module.kw * 1000) / module.voltage;
    const chargeNeeded = 100 - module.charge;
    const chargePerSecond = (module.kw * 1000) / (module.voltage * 3600);

    // 온도에 따라 충전 속도 조정 (50도 이상일 때 속도 절반)
    const adjustedChargePerSecond =
      module.temperature >= 50 ? chargePerSecond * 0.5 : chargePerSecond;

    const expectedTime = chargeNeeded / adjustedChargePerSecond;
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
          overheatingTime: 0,
        };
      } else {
        const { current, expectedTime } = calculateCharging(module);
        newModules[index] = {
          ...module,
          isCharging: true,
          current,
          expectedTime,
          overheatingTime: 0,
        };
      }
      return newModules;
    });
  };

  // 충전 및 온도 증가
  useEffect(() => {
    const interval = setInterval(() => {
      setModules((prevModules) =>
        prevModules.map((module, i) => {
          if (module.isCharging && module.charge < 100) {
            const newCharge = Math.min(module.charge + 1, 100);

            // 1개의 배터리만 비정상적으로 온도 상승
            let newTemp = module.temperature;
            if (i === 1) {
              newTemp += Math.random() * 2.5;
            } else {
              newTemp += Math.random() * 0.5;
            }

            let overheatingTime = module.overheatingTime;
            if (newTemp >= 100) {
              overheatingTime += 1;
            } else {
              overheatingTime = 0;
            }

            // 온도가 100℃ 이상 10초 지속되면 충전 중단
            if (overheatingTime >= 10) {
              return {
                ...module,
                isCharging: false,
                expectedTime: null,
                current: 0,
                overheatingTime,
              };
            }

            // 남은 시간 감소
            const newTime = module.expectedTime
              ? module.expectedTime - 1
              : null;
            return {
              ...module,
              charge: newCharge,
              temperature: newTemp,
              expectedTime: newTime,
              overheatingTime,
            };
          } else if (module.charge >= 100) {
            return {
              ...module,
              isCharging: false,
              expectedTime: null,
              current: 0,
              overheatingTime: 0,
            };
          }
          return module;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 사용자로부터 KW, V 값을 업데이트
  const handleKwChange = (index: number, value: number) => {
    setModules((prevModules) => {
      const newModules = [...prevModules];
      newModules[index].kw = value;
      return newModules;
    });
  };

  const handleVoltageChange = (index: number, value: number) => {
    setModules((prevModules) => {
      const newModules = [...prevModules];
      newModules[index].voltage = value;
      return newModules;
    });
  };

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
                  module.overheatingTime >= 10
                    ? 'bg-red-700'
                    : module.temperature > 50
                    ? 'bg-orange-500'
                    : 'bg-green-500'
                }`}
                animate={{ height: `${module.charge}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p>Charge: {module.charge}%</p>
            <p className={module.temperature >= 100 ? 'text-red-500' : ''}>
              Temp: {module.temperature.toFixed(1)}°C
            </p>
            <p>Current: {module.current.toFixed(2)} A</p>
            <p>
              Time Left:{' '}
              {module.expectedTime
                ? Math.max((module.expectedTime / 60).toFixed(2), 0)
                : '-'}{' '}
              min
            </p>

            <div className="flex justify-center gap-2 mb-2">
              <input
                type="number"
                value={module.kw}
                onChange={(e) =>
                  handleKwChange(index, parseFloat(e.target.value))
                }
                className="px-2 py-1 rounded text-black"
                min="0"
              />
              <input
                type="number"
                value={module.voltage}
                onChange={(e) =>
                  handleVoltageChange(index, parseFloat(e.target.value))
                }
                className="px-2 py-1 rounded text-black"
                min="0"
              />
            </div>

            <button
              onClick={() => toggleCharging(index)}
              className={`mt-2 px-3 py-1 rounded ${
                module.isCharging ? 'bg-red-600' : 'bg-green-600'
              }`}
              disabled={module.overheatingTime >= 10}
            >
              {module.isCharging
                ? 'Stop'
                : module.overheatingTime >= 10
                ? 'Overheated'
                : 'Start'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
