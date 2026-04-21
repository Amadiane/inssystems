import React from 'react';
import Footersociallink from './Footersociallink';

const Footerlastpart = () => {
  return (
    <div className="bg-[#1C1C47] text-white py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-6">
        {/* Réseaux sociaux bien centrés */}
        <div className="flex justify-center w-full">
          <Footersociallink />
        </div>
        
        {/* Texte Copyright bien centré et responsive */}
        <p className="text-xs sm:text-sm text-center leading-relaxed">
          © 2026 Copyright TEKACOM - Tous droits réservés. 
        </p>
      </div>
    </div>
  );
};

export default Footerlastpart;
