import { useEffect, useRef } from 'react';
import { useAppStore } from '../app/store';

function WinLossOverlay(): React.JSX.Element | null {
  const winLossOverlayOpen = useAppStore((s) => s.winLossOverlayOpen);
  const matchData = useAppStore((s) => s.matchData);
  const resetMatchData = useAppStore((s) => s.resetMatchData);
  const closeWinLossOverlay = useAppStore((s) => s.closeWinLossOverlay);
  const goToMenu = useAppStore((s) => s.goToMenu);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!winLossOverlayOpen) return;
    firstButtonRef.current?.focus();
  }, [winLossOverlayOpen]);

  if (!winLossOverlayOpen) return null;

  const handleRestart = (): void => {
    resetMatchData();
    closeWinLossOverlay();
  };

  const handleReturnToMenu = (): void => {
    goToMenu();
  };

  const renderTitle = (): React.JSX.Element => {
    if (matchData.winner) {
      const side = matchData.winner === 'left' ? 'Left' : 'Right';
      return <h2 className="overlay__title">Player {side} Wins!</h2>;
    }
    return <h2 className="overlay__title">Game Over</h2>;
  };

  const renderSubtitle = (): React.JSX.Element | null => {
    if (matchData.finalScore !== null && !matchData.winner) {
      return <p className="overlay__subtitle">Score: {matchData.finalScore}</p>;
    }
    return null;
  };

  return (
    <div className="overlay">
      {renderTitle()}
      {renderSubtitle()}
      <div className="overlay__actions">
        <button className="btn btn--primary" ref={firstButtonRef} onClick={handleRestart}>
          Restart
        </button>
        <button className="btn btn--danger" onClick={handleReturnToMenu}>
          Return to Menu
        </button>
      </div>
    </div>
  );
}

export default WinLossOverlay;
