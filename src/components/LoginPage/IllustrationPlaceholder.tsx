import React from 'react';
import './IllustrationPlaceholder.css';

export const IllustrationPlaceholder: React.FC = () => {
  return (
    <div className="illustration-container">
      {/* Background circuit grid */}
      <div className="illustration-bg"></div>
      
      {/* Glowing base */}
      <div className="illustration-glow"></div>
      
      {/* The Robot Placeholder */}
      <div className="illustration-robot">
        <img 
          src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=3d%20cute%20white%20and%20blue%20robot%20sitting%20on%20a%20glowing%20AI%20chip%20processor,%20isometric%20tech%20illustration,%20clean%20background&image_size=square"
          alt="Robot Mascot"
          className="illustration-img"
        />
      </div>
    </div>
  );
};
