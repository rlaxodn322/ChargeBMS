'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

type Module = {
  charge: number;
  temperature: number;
  isCharging: boolean;
  overheatedAt: number | null;
  isOverheating: boolean;
  expectedTime: number | null;
  totalCost: number | null; // 각 모듈별 요금을 추가
};

export default function ChargerSimulator() {
  const [modules, setModules] = useState<Module[]>(
    Array(9)
      .fill(undefined)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map((_, i) => ({
        charge: 0,
        temperature: 25,
        isCharging: false,
        overheatedAt: null,
        isOverheating: false,
        expectedTime: null,
        totalCost: null, // 초기에는 요금이 없음
      }))
  );

  const [inputKw, setInputKw] = useState<number>(7);
  const [inputVoltage, setInputVoltage] = useState<number>(400);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isChargingStarted, setIsChargingStarted] = useState<boolean>(false);
  const [chargeComplete, setChargeComplete] = useState<boolean>(false);

  // 예상 시간 계산 (초 단위로 변환)
  const calculateExpectedTime = (module: Module): number => {
    const timeInHours =
      ((inputKw / (inputVoltage / 100)) * (100 - module.charge)) / 100;
    return timeInHours * 3600; // 초 단위로 변환
  };

  // 요금 계산 함수 (kWh당 300원)
  const calculateCost = (charge: number): number => {
    return (charge / 100) * inputKw * 300; // 300원이 kWh당 요금
  };

  // 충전 상태 업데이트 함수
  const startCharging = () => {
    setIsChargingStarted(true);

    // 랜덤으로 두 개의 모듈을 과열 상태로 설정
    const randomModules = Array.from({ length: 2 }, () =>
      Math.floor(Math.random() * 9)
    );
    setModules((prevModules) =>
      prevModules.map((module, index) => ({
        ...module,
        isOverheating: randomModules.includes(index),
      }))
    );

    setModules((prevModules) =>
      prevModules.map((module) => {
        const expectedTime = calculateExpectedTime(module);
        return { ...module, expectedTime };
      })
    );

    const interval = setInterval(() => {
      setModules((prevModules) => {
        return prevModules.map((module) => {
          if (!module.isCharging) return module;

          let newCharge = module.charge;
          const newTemperature = module.isOverheating
            ? Math.floor(module.temperature + Math.random() * 10)
            : 25;

          let newIsCharging:boolean = module.isCharging;
          let newOverheatedAt = module.overheatedAt;

          // 오버히팅 처리
          if (module.isOverheating && newTemperature > 100) {
            if (!newOverheatedAt) {
              newOverheatedAt = Date.now();
            }
            newCharge += 0.5;
          } else {
            newCharge += 1;
          }

          if (newCharge >= 100) {
            newCharge = 100;
            newIsCharging = false;
            setChargeComplete(true);
          }

          if (newOverheatedAt && Date.now() - newOverheatedAt > 10000) {
            newIsCharging = false;
          }

          const expectedTime = calculateExpectedTime(module);
          const newTotalCost =
            newCharge === 100 ? calculateCost(newCharge) : null; // 충전 완료 시 요금 계산

          return {
            charge: newCharge,
            temperature: newTemperature,
            isCharging: newIsCharging,
            overheatedAt: newOverheatedAt,
            isOverheating: module.isOverheating,
            expectedTime: expectedTime,
            totalCost: newTotalCost, // 각 모듈별로 요금 저장
          };
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  };

  // 충전 상태 토글 함수
  const handleChargeToggle = (index: number) => {
    setModules((prevModules) => {
      const newModules = [...prevModules];
      newModules[index] = {
        ...newModules[index],
        isCharging: !newModules[index].isCharging,
      };
      return newModules;
    });
  };

  return (
    <div className="p-5 flex flex-col items-center bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Charger Simulator</h1>
      <div className="flex flex-col items-center mb-6">
        <label htmlFor="kw" className="text-sm mb-1">
          KW (충전 속도)
        </label>
        <input
          id="kw"
          type="number"
          value={inputKw}
          onChange={(e) => setInputKw(Number(e.target.value))}
          className="bg-gray-800 text-white py-2 px-4 mb-4 rounded"
          placeholder="Enter KW"
        />
        <label htmlFor="voltage" className="text-sm mb-1">
          Voltage (전압)
        </label>
        <input
          id="voltage"
          type="number"
          value={inputVoltage}
          onChange={(e) => setInputVoltage(Number(e.target.value))}
          className="bg-gray-800 text-white py-2 px-4 mb-4 rounded"
          placeholder="Enter Voltage"
        />
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded mt-4"
          onClick={startCharging}
        >
          Start Charging
        </button>
      </div>
      <div className="flex flex-wrap justify-center mt-8 gap-8">
        {modules.map((module, index) => (
          <div
            key={index}
            className="relative flex flex-col items-center mx-4 mb-8"
          >
            <motion.div
              className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 w-1 h-16"
              style={{ backgroundColor: module.isCharging ? 'green' : 'red' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1.2 }}
              transition={{ duration: 0.5 }}
            ></motion.div>
            <motion.div
              className="w-20 h-20 flex flex-col items-center justify-center border rounded-full shadow-md text-black font-bold"
              style={{
                background: module.isCharging ? '#e0f7fa' : '#ffccbc',
                color: module.temperature > 100 ? 'red' : 'black',
                borderColor: module.temperature > 100 ? 'red' : 'gray',
                borderWidth: 2,
              }}
              initial={{ scale: 0.2 }}
              animate={{ scale: 1.3 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-sm">M{index + 1}</p>
              <p className="text-lg">{module.charge}%</p>
              <p className="text-sm">{module.temperature}°C</p>
            </motion.div>
            {module.isCharging ? (
              <p className="mt-2 text-sm text-gray-300">
                예상 시간: {module.expectedTime?.toFixed(0)} 초
              </p>
            ) : module.charge === 100 ? (
              <p className="mt-2 text-sm text-green-500">SOC 100% 완료</p>
            ) : module.isOverheating &&
              Date.now() - (module.overheatedAt || 0) > 10000 ? (
              <p className="mt-2 text-sm text-red-500">과열! 충전 중지됨</p>
            ) : null}
            {module.totalCost !== null && (
              <p className="mt-2 text-sm text-yellow-500">
                충전 완료 요금: {module.totalCost}원
              </p>
            )}
            <button
              className="mt-4 bg-green-500 text-white py-1 px-4 rounded-md"
              onClick={() => handleChargeToggle(index)}
            >
              {module.isCharging ? '충전 중지' : '충전 시작'}
            </button>
          </div>
        ))}
      </div>

      {chargeComplete && (
        <div className="mt-4 text-lg text-green-500">충전 완료!</div>
      )}
    </div>
  );
}
