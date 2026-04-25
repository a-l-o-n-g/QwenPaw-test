import React from 'react';
import { motion } from 'framer-motion';

export const QRCodeDisplay: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 mb-6 relative overflow-hidden"
      >
        <img
          src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://www.example.com"
          alt="QR Code"
          className="w-48 h-48 object-contain mix-blend-multiply"
        />
        {/* Animated scanning line */}
        <motion.div
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          className="absolute left-0 right-0 h-0.5 bg-blue-400/50 shadow-[0_0_8px_2px_rgba(59,130,246,0.5)] z-10"
        />
      </motion.div>

      <div className="flex justify-center items-center text-xs">
        <label className="flex items-center gap-2 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors">
          <input
            type="checkbox"
            className="w-3.5 h-3.5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span>15天内自动登录</span>
        </label>
      </div>
    </div>
  );
};
