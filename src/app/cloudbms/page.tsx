'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type Module = {
  charge: number;
  temperature: number;
  isCharging: boolean;
  overheatedAt: number | null;
  isOverheating: boolean;
};

export default function ChargerSimulator() {
  const [modules, setModules] = useState<Module[]>(
    Array(9)
      .fill(undefined)
      .map((_, i) => ({
        charge: 0,
        temperature: 25,
        isCharging: true, // 초기 충전 상태를 true로 설정하여 자동으로 충전 시작
        overheatedAt: null,
        isOverheating: i === 4,
        // 첫 번째 모듈만 오버히팅 상태로 설정
      }))
  );

  // 충전 상태 토글 함수
  const handleChargeToggle = (index: number) => {
    setModules((prevModules) => {
      const newModules = [...prevModules]; // 기존 배열 복사

      // 해당 모듈을 수정
      newModules[index] = {
        ...newModules[index], // 기존 모듈 값을 복사
        isCharging: !newModules[index].isCharging, // 충전 상태를 토글
      };

      return newModules; // 업데이트된 배열 반환
    });
  };

  // 충전 상태 업데이트 (1초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      setModules((prevModules) => {
        return prevModules.map((module) => {
          if (!module.isCharging) return module; // 충전 중이 아니면 그대로 반환

          let newCharge = module.charge;
          const newTemperature = module.isOverheating
            ? Math.floor(module.temperature + Math.random() * 10) // 오버히팅 모듈은 온도 상승
            : 25;

          let newIsCharging: boolean = module.isCharging;
          let newOverheatedAt: number | null = module.overheatedAt;

          // 오버히팅 처리
          if (module.isOverheating && newTemperature > 100) {
            if (!newOverheatedAt) {
              newOverheatedAt = Date.now(); // 오버히팅 시작 시간을 기록
            }
            newCharge += 0.5; // 오버히팅 중일 때는 충전 속도 감소
          } else {
            newCharge += 1; // 정상 상태에서는 충전
          }

          if (newCharge >= 100) {
            newCharge = 100;
            newIsCharging = false; // 100% 도달 시 충전 종료
          }

          // 너무 오래 오버히팅되면 충전 멈춤
          if (newOverheatedAt && Date.now() - newOverheatedAt > 10000) {
            newIsCharging = false;
          }

          return {
            charge: newCharge,
            temperature: newTemperature,
            isCharging: newIsCharging,
            overheatedAt: newOverheatedAt,
            isOverheating: module.isOverheating,
          };
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-5 flex flex-col items-center bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Charger Simulator</h1>
      <div className="flex flex-col items-center relative">
        <motion.div
          className="w-28 h-20 bg-blue-500 text-white flex items-center justify-center rounded-md shadow-xl relative"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          Charger
        </motion.div>
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
              <button
                className="mt-4 bg-green-500 text-white py-1 px-4 rounded-md"
                onClick={() => handleChargeToggle(index)} // 버튼 클릭 시 충전 상태 토글
              >
                {module.isCharging ? 'Stop Charge' : 'Start Charge'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
