import React, { useState } from 'react';
import { User, Lock, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type AccountMode = 'password' | 'code';

export const AccountForm: React.FC = () => {
  const [mode, setMode] = useState<AccountMode>('password');

  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence mode="wait">
        {mode === 'password' ? (
          <motion.div
            key="password"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">账号</label>
              <div className="relative flex items-center bg-white border border-gray-200 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all overflow-hidden h-11 shadow-sm">
                <div className="pl-3 text-gray-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="请输入账号"
                  className="w-full bg-transparent outline-none px-3 text-sm placeholder:text-gray-400 text-gray-800"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">密码</label>
              <div className="relative flex items-center bg-white border border-gray-200 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all overflow-hidden h-11 shadow-sm">
                <div className="pl-3 text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="输入密码"
                  className="w-full bg-transparent outline-none px-3 text-sm placeholder:text-gray-400 text-gray-800"
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="code"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">手机号</label>
              <div className="relative flex items-center bg-white border border-gray-200 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all overflow-hidden h-11 shadow-sm">
                <input
                  type="tel"
                  placeholder="请输入手机号"
                  className="w-full bg-transparent outline-none px-3 text-sm placeholder:text-gray-400 text-gray-800"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">验证码</label>
              <div className="relative flex items-center bg-white border border-gray-200 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all overflow-hidden h-11 shadow-sm pr-1">
                <input
                  type="text"
                  placeholder="输入密码" /* matching the typo in the design */
                  className="w-full bg-transparent outline-none px-3 text-sm placeholder:text-gray-400 text-gray-800"
                />
                <button
                  type="button"
                  className="whitespace-nowrap bg-blue-500 hover:bg-blue-600 text-white text-xs px-4 py-1.5 rounded-md transition-colors shadow-sm"
                >
                  获取验证码
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mt-2 text-xs">
        <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-800 transition-colors">
          <input
            type="checkbox"
            className="w-3.5 h-3.5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span>自动登录</span>
        </label>
        
        <button
          type="button"
          onClick={() => setMode(mode === 'password' ? 'code' : 'password')}
          className="text-blue-500 hover:text-blue-600 transition-colors"
        >
          {mode === 'password' ? '验证码登录' : '密码登录'}
        </button>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full py-3 mt-4 text-sm font-medium tracking-wide shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
      >
        登 录
      </button>
    </div>
  );
};
