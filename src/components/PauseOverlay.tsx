import { useEffect, useRef } from 'react';
import { useAppStore } from '../app/store';
import eventBridge from '../game/systems/EventBridge';

function PauseOverlay(): React.JSX.Element | null {
  const pauseOverlayOpen = useAppStore((s) => s.pauseOverlayOpen);
  const closePauseOverlay = useAppStore((s) => s.closePauseOverlay);
  const resetMatchData = useAppStore((s) => s.resetMatchData);
  const goToMenu = useAppStore((s) => s.goToMenu);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!pauseOverlayOpen) return;

    firstButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePauseOverlay();
        eventBridge.emit('match:pause', { paused: false });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [pauseOverlayOpen, closePauseOverlay]);

  if (!pauseOverlayOpen) return null;

  const handleResume = (): void => {
    closePauseOverlay();
    eventBridge.emit('match:pause', { paused: false });
  };

  const handleRestart = (): void => {
    resetMatchData();
    closePauseOverlay();
  };

  const handleReturnToMenu = (): void => {
    goToMenu();
  };

  return (
    <div className="overlay">
      <h2 className="overlay__title">PAUSED</h2>
      <div className="overlay__actions">
        <button className="btn btn--primary" ref={firstButtonRef} onClick={handleResume}>
          Resume
        </button>
        <button className="btn" onClick={handleRestart}>
          Restart
        </button>
        <button className="btn btn--danger" onClick={handleReturnToMenu}>
          Return to Menu
        </button>
      </div>
    </div>
  );
}

export default PauseOverlay;
