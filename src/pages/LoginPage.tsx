import React from 'react';
import { motion } from 'framer-motion';
import { LoginCard } from '../components/LoginCard';
import { IllustrationPlaceholder } from '../components/IllustrationPlaceholder';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#EAEFFF] via-[#DCEBFF] to-[#D4E3FF] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#BBD5FF]/40 to-transparent"></div>
        {/* Abstract wave/grid placeholders */}
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-r from-pink-300/20 to-blue-400/20 blur-[100px]"></div>
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-blue-300/30 blur-[80px]"></div>
      </div>

      {/* Header / Logo */}
      <div className="absolute top-8 left-8 z-20 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#004A99] flex items-center justify-center text-white overflow-hidden shadow-md">
           {/* Custom SVG logo mimicking the design (a circle with H-like lines) */}
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
             <path d="M4 12h16M12 4v16M8 8l8 8M16 8l-8 8" />
           </svg>
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-wider">皓峰通讯</span>
      </div>

      {/* Main Content Container */}
      <div className="z-10 w-full max-w-[1200px] px-4 md:px-8 flex flex-col md:flex-row items-center justify-center md:justify-around gap-12 lg:gap-24">
        {/* Left Side: 3D Illustration */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden md:flex flex-1 items-center justify-center"
        >
          <IllustrationPlaceholder />
        </motion.div>

        {/* Right Side: Login Card */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-[420px]"
        >
          <LoginCard />
        </motion.div>
      </div>
    </div>
  );
};
