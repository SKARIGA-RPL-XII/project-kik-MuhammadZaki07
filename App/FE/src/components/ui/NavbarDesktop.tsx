import React from 'react';

const NavbarDesktop: React.FC = () => {
  const isElectron = navigator.userAgent.toLowerCase().includes('electron');

  if (!isElectron) return null;

  const handleAction = (action: 'minimize' | 'maximize' | 'close') => {
    // @ts-ignore
    window.require('electron').ipcRenderer.send('window-controls', action);
  };

  return (
    <div className="flex items-center sticky top-0 z-[999999] justify-between bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 h-8 select-none" 
         style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      
      <div className="px-4 text-xs font-medium text-neutral-500 dark:text-neutral-400">
        Gagal Lapar - Cashier Mode
      </div>

      <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button 
          onClick={() => handleAction('minimize')}
          className="px-4 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
        >
          —
        </button>
        <button 
          onClick={() => handleAction('maximize')}
          className="px-4 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
        >
          🗖
        </button>
        <button 
          onClick={() => handleAction('close')}
          className="px-4 transition-colors hover:bg-red-500 hover:text-white text-neutral-600 dark:text-neutral-300"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default NavbarDesktop;