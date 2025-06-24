
import React from 'react';

interface PauseScreenProps {
  isActive: boolean;
  onResume: () => void;
}

export const PauseScreen: React.FC<PauseScreenProps> = ({ isActive, onResume }) => {
  if (!isActive) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center cursor-pointer"
      onClick={onResume}
    >
      <div className="max-w-4xl w-full flex flex-col items-center justify-center space-y-6 p-6">

        <div className="h-20" />

        
        <div className="text-center space-y-3 animate-fade-in">
          <h2 className="text-3xl font-light text-gray-700 dark:text-gray-300">
            Momento de Pausa
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl leading-relaxed">
            Respire fundo, relaxe e recarregue suas energias
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-6">
            Clique em qualquer lugar para continuar
          </p>
        </div>
      </div>
    </div>
  );
};
