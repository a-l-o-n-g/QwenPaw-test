import React from 'react';
import './QRCodeDisplay.css';

export const QRCodeDisplay: React.FC = () => {
  return (
    <div className="qrcode-container">
      <div className="qrcode-box">
        <img
          src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://www.example.com"
          alt="QR Code"
          className="qrcode-img"
        />
        {/* Animated scanning line */}
        <div className="qrcode-scan-line" />
      </div>

      <div className="qrcode-actions">
        <label className="checkbox-label">
          <input
            type="checkbox"
            className="checkbox-input"
          />
          <span>15天内自动登录</span>
        </label>
      </div>
    </div>
  );
};
