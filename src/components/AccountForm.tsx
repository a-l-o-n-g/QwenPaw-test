import React, { useState } from 'react';
import { User, Lock } from 'lucide-react';

type AccountMode = 'password' | 'code';

export const AccountForm: React.FC = () => {
  const [mode, setMode] = useState<AccountMode>('password');

  return (
    <div className="account-form">
      <div className={`form-mode-panel ${mode === 'password' ? 'active' : 'inactive-right'}`}>
        <div className="input-group">
          <label className="input-label">账号</label>
          <div className="input-wrapper">
            <div className="input-icon">
              <User size={18} />
            </div>
            <input
              type="text"
              placeholder="请输入账号"
              className="input-field"
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">密码</label>
          <div className="input-wrapper">
            <div className="input-icon">
              <Lock size={18} />
            </div>
            <input
              type="password"
              placeholder="输入密码"
              className="input-field"
            />
          </div>
        </div>
      </div>

      <div className={`form-mode-panel ${mode === 'code' ? 'active' : 'inactive-left'}`}>
        <div className="input-group">
          <label className="input-label">手机号</label>
          <div className="input-wrapper">
            <input
              type="tel"
              placeholder="请输入手机号"
              className="input-field"
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">验证码</label>
          <div className="input-wrapper pr-1">
            <input
              type="text"
              placeholder="输入密码" /* matching the typo in the design */
              className="input-field"
            />
            <button
              type="button"
              className="get-code-btn"
            >
              获取验证码
            </button>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <label className="checkbox-label">
          <input
            type="checkbox"
            className="checkbox-input"
          />
          <span>自动登录</span>
        </label>
        
        <button
          type="button"
          onClick={() => setMode(mode === 'password' ? 'code' : 'password')}
          className="switch-mode-btn"
        >
          {mode === 'password' ? '验证码登录' : '密码登录'}
        </button>
      </div>

      <button
        type="submit"
        className="submit-btn"
      >
        登 录
      </button>
    </div>
  );
};
