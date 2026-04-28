import React, { useState } from 'react';
import { AccountForm } from './AccountForm';
import { QRCodeDisplay } from './QRCodeDisplay';

type Tab = 'account' | 'qrcode';

export const LoginCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('account');

  return (
    <div className="bg-[#EEF4FF]/90 backdrop-blur-md rounded-[20px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-8 w-full border border-white/50 min-h-[460px] flex flex-col">
      {/* Title */}
      <h2 className="text-2xl font-semibold text-center text-gray-800 mt-2 mb-8">
        Hello!欢迎您登录
      </h2>

      {/* Tabs */}
      <div className="flex gap-6 mb-8 relative border-b border-gray-200 pb-3 px-2 justify-start">
        <button
          onClick={() => setActiveTab('account')}
          className={`relative text-base font-medium transition-colors ${
            activeTab === 'account' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          账号登录
          <div
            className={`absolute -bottom-[13px] left-0 right-0 h-[2px] bg-blue-600 rounded-full transition-all duration-300 ${
              activeTab === 'account' ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
            }`}
          />
        </button>
        <button
          onClick={() => setActiveTab('qrcode')}
          className={`relative text-base font-medium transition-colors ${
            activeTab === 'qrcode' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          扫码登录
          <div
            className={`absolute -bottom-[13px] left-0 right-0 h-[2px] bg-blue-600 rounded-full transition-all duration-300 ${
              activeTab === 'qrcode' ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 relative">
        <div className={`transition-opacity duration-300 ${activeTab === 'account' ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-0 pointer-events-none z-0'}`}>
          {activeTab === 'account' && <AccountForm />}
        </div>
        <div className={`h-full flex flex-col transition-opacity duration-300 ${activeTab === 'qrcode' ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-0 pointer-events-none z-0'}`}>
          {activeTab === 'qrcode' && <QRCodeDisplay />}
        </div>
      </div>
    </div>
  );
};
