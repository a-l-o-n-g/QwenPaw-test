import React, { useState } from 'react';
import { AccountForm } from './AccountForm';
import { QRCodeDisplay } from './QRCodeDisplay';

type Tab = 'account' | 'qrcode';

export const LoginCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('account');

  return (
    <div className="login-card">
      {/* Title */}
      <h2 className="login-title">
        Hello!欢迎您登录
      </h2>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          onClick={() => setActiveTab('account')}
          className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
        >
          账号登录
          <div className={`tab-indicator ${activeTab === 'account' ? 'active' : ''}`} />
        </button>
        <button
          onClick={() => setActiveTab('qrcode')}
          className={`tab-btn ${activeTab === 'qrcode' ? 'active' : ''}`}
        >
          扫码登录
          <div className={`tab-indicator ${activeTab === 'qrcode' ? 'active' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="card-content">
        <div className={`tab-panel ${activeTab === 'account' ? 'active' : 'inactive'}`}>
          {activeTab === 'account' && <AccountForm />}
        </div>
        <div className={`tab-panel qrcode-panel ${activeTab === 'qrcode' ? 'active' : 'inactive'}`}>
          {activeTab === 'qrcode' && <QRCodeDisplay />}
        </div>
      </div>
    </div>
  );
};
