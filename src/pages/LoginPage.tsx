import React from 'react';
import { LoginCard } from '../components/LoginPage/LoginCard';
import { IllustrationPlaceholder } from '../components/LoginPage/IllustrationPlaceholder';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  return (
    <div className="login-page">
      {/* Decorative Background Elements */}
      <div className="bg-decorative-container">
        <div className="bg-gradient-bottom"></div>
        {/* Abstract wave/grid placeholders */}
        <div className="bg-blob-1"></div>
        <div className="bg-blob-2"></div>
      </div>

      {/* Header / Logo */}
      <div className="logo-container">
        <div className="logo-icon-wrapper">
           {/* Custom SVG logo mimicking the design (a circle with H-like lines) */}
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logo-icon">
             <path d="M4 12h16M12 4v16M8 8l8 8M16 8l-8 8" />
           </svg>
        </div>
        <span className="logo-text">皓峰通讯</span>
      </div>

      {/* Main Content Container */}
      <div className="main-content">
        {/* Left Side: 3D Illustration */}
        <div className="left-side">
          <IllustrationPlaceholder />
        </div>

        {/* Right Side: Login Card */}
        <div className="right-side">
          <LoginCard />
        </div>
      </div>
    </div>
  );
};
