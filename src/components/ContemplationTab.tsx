
import React from 'react';

export const ContemplationTab: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full flex flex-col items-center justify-center space-y-6">
        <div className="relative w-full max-w-2xl aspect-[2/1] flex items-center justify-center">
          <img
            src="/images/contemplation-bg.png"
            alt="Espaço de contemplação"
            className="w-full h-auto max-h-96 object-contain drop-shadow-lg"
            loading="lazy"
          />
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-light text-gray-700 dark:text-gray-300">
            Momento de Pausa
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md">
            Um espaço para respirar, refletir e retomar o foco antes de continuar com suas tarefas.
          </p>
        </div>
      </div>
    </div>
  );
};
