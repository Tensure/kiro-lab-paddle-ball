import { useAppStore } from '../app/store';
import type { GameMode } from '../game/types/modes';

function ModeSelectionScreen(): React.JSX.Element {
  const selectMode = useAppStore((s) => s.selectMode);

  const handleSelect = (mode: GameMode): void => {
    selectMode(mode);
  };

  return (
    <div>
      <h1 className="screen-title">Select Mode</h1>
      <div className="mode-grid">
        <button className="mode-card" onClick={() => handleSelect('pong-solo')}>
          Pong: Solo
        </button>
        <button className="mode-card" onClick={() => handleSelect('pong-versus')}>
          Pong: Versus
        </button>
        <button className="mode-card" onClick={() => handleSelect('breakout')}>
          Breakout
        </button>
      </div>
    </div>
  );
}

export default ModeSelectionScreen;
