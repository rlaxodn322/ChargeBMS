'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ChargerSimulator() {
  const [modules, setModules] = useState(
    Array(9)
      .fill(undefined) // Fill with undefined
      .map((_, i) => ({
        charge: 0,
        temperature: 25,
        isCharging: false,
        overheatedAt: null,
        isOverheating: i === 2, // Only one module will randomly overheat
      }))
  );
  const handleCharge = (index: number) => {
    setModules((prevModules) => {
      const newModules = [...prevModules];
      // eslint-disable-next-line @next/next/no-assign-module-variable
      const module = newModules[index];

      if (!module.isCharging) {
        module.isCharging = true;
      }

      return newModules;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setModules((prevModules) => {
        return prevModules.map((module) => {
          if (!module.isCharging) return module;

          let newCharge = module.charge;
          const newTemperature = module.isOverheating
            ? Math.floor(module.temperature + Math.random() * 10)
            : 25;
          let newIsCharging: boolean | null = module.isCharging;
          let newOverheatedAt: number | null = module.overheatedAt;

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
          }

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
        <div className="flex flex-row items-center relative mt-8">
          {modules.map((module, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center mx-4"
            >
              <motion.div
                className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 w-1 h-16"
                style={{ backgroundColor: module.isCharging ? 'green' : 'red' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1.2 }}
                transition={{ duration: 0.5 }}
              ></motion.div>
              <motion.div
                className="w-20 h-20 flex flex-col items-center justify-center border rounded-full shadow-md text-black font-bold mt-6"
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
                onClick={() => handleCharge(index)}
              >
                Charge
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
