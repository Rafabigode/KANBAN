
import { useState, useEffect, useCallback } from 'react';

interface UseInactivityTimerProps {
  timeout: number; // em milissegundos
  onInactive: () => void;
}

export const useInactivityTimer = ({ timeout, onInactive }: UseInactivityTimerProps) => {
  const [isActive, setIsActive] = useState(true);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setIsActive(true);
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isActive) {
      timeoutId = setTimeout(() => {
        onInactive();
      }, timeout);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isActive, timeout, onInactive]);

  useEffect(() => {
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    const resetTimerHandler = () => resetTimer();

    // Adiciona os event listeners
    events.forEach((event) => {
      document.addEventListener(event, resetTimerHandler, true);
    });

    return () => {
      // Remove os event listeners
      events.forEach((event) => {
        document.removeEventListener(event, resetTimerHandler, true);
      });
    };
  }, [resetTimer]);

  return { resetTimer };
};
