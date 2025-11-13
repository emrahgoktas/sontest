import React, { useEffect } from 'react';
import { forceClearOverlays } from '../../utils/overlayCleanup';

const OverlayGuard: React.FC = () => {
  useEffect(() => {
    forceClearOverlays();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestAnimationFrame(forceClearOverlays);
    };
    const onClick = () => requestAnimationFrame(forceClearOverlays);
    const onVisibility = () => forceClearOverlays();
    const onPopState = () => forceClearOverlays();

    document.addEventListener('click', onClick, true);
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('popstate', onPopState);
    window.addEventListener('hashchange', onPopState);

    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('hashchange', onPopState);
      forceClearOverlays();
    };
  }, []);
  return null;
};

export default OverlayGuard;

