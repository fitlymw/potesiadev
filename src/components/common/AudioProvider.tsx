import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { playClick, playTransition } from '@/lib/audio';

interface AudioProviderProps {
  children: ReactNode;
}

// Elements that should always play click sound
const INTERACTIVE_SELECTORS = [
  'button',
  'a',
  'input',
  'select',
  'textarea',
  '[role="button"]',
  '[role="tab"]',
  '[role="menuitem"]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function AudioProvider({ children }: AudioProviderProps): ReactNode {
  const location = useLocation();

  // Play transition sound on route change
  useEffect(() => {
    playTransition();
  }, [location.pathname]);

  // Handle click sounds on all interactive elements
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Nightfall is played with eyes closed: taps must not make a sound that others can hear
      if (window.location.hash.startsWith('#/games/nightfall') || window.location.pathname.includes('/games/nightfall')) return;
      const target = e.target as HTMLElement;
      
      // Check if clicked element or its parent is interactive
      const isInteractiveElement = 
        target.matches(INTERACTIVE_SELECTORS) ||
        target.closest(INTERACTIVE_SELECTORS);

      // Check for cursor pointer style
      const style = window.getComputedStyle(target);
      const hasPointerCursor = style.cursor === 'pointer';

      // Check if element has clickable parent with pointer cursor
      const closestWithPointer = target.closest('[style*="cursor: pointer"]');

      if (isInteractiveElement || hasPointerCursor || closestWithPointer) {
        playClick();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return <>{children}</>;
}
