
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/80 dark:bg-black/30 backdrop-blur-sm border-b border-gray-200 dark:border-white/10 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Bricki AI</span>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-normal hidden sm:inline">by Creative Blocks</span>
        </div>
        <button 
          onClick={() => alert('Login-Funktionalität ist in Entwicklung und erfordert ein Backend-Setup, um Modelle zu speichern.')}
          className="bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          Login / Speichern
        </button>
      </div>
    </header>
  );
};