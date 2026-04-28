import React from 'react';

export const IllustrationPlaceholder: React.FC = () => {
  return (
    <div className="relative w-[400px] h-[400px] flex items-center justify-center">
      {/* Background circuit grid */}
      <div className="absolute inset-0 bg-[url('https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=isometric%20blue%20circuit%20board%20grid%20glowing%20tech%20background%203d&image_size=square')] bg-center bg-contain bg-no-repeat opacity-50"></div>
      
      {/* Glowing base */}
      <div 
        className="absolute bottom-[20%] w-[250px] h-[100px] bg-blue-500 rounded-[50%] blur-[40px] animate-pulse-slow"
      ></div>
      
      {/* The Robot Placeholder */}
      <div
        className="relative z-10 animate-float"
      >
        <img 
          src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=3d%20cute%20white%20and%20blue%20robot%20sitting%20on%20a%20glowing%20AI%20chip%20processor,%20isometric%20tech%20illustration,%20clean%20background&image_size=square"
          alt="Robot Mascot"
          className="w-[320px] h-[320px] object-contain drop-shadow-2xl mix-blend-multiply"
        />
      </div>
    </div>
  );
};
