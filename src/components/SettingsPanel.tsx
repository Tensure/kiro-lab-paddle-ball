import { useState } from 'react';
import { useAppStore } from '../app/store';
import { validateSettings } from '../game/rules/settings-validator';
import type { AIDifficultyPreset } from '../game/types/modes';

function SettingsPanel(): React.JSX.Element {
  const selectedMode = useAppStore((s) => s.selectedMode);
  const winScore = useAppStore((s) => s.winScore);
  const aiDifficulty = useAppStore((s) => s.aiDifficulty);
  const powerupsEnabled = useAppStore((s) => s.powerupsEnabled);
  const setWinScore = useAppStore((s) => s.setWinScore);
  const setAiDifficulty = useAppStore((s) => s.setAiDifficulty);
  const setPowerupsEnabled = useAppStore((s) => s.setPowerupsEnabled);
  const startMatch = useAppStore((s) => s.startMatch);
  const goToMenu = useAppStore((s) => s.goToMenu);

  const [errors, setErrors] = useState<readonly string[]>([]);

  const handleStart = (): void => {
    const input = buildSettingsInput();
    const result = validateSettings(input);
    if (result.valid) {
      setErrors([]);
      startMatch();
    } else {
      setErrors(result.errors);
    }
  };

  const buildSettingsInput = (): Record<string, unknown> => {
    switch (selectedMode) {
      case 'pong-solo':
        return { mode: 'pong-solo', winScore, aiDifficulty, powerupsEnabled };
      case 'pong-versus':
        return { mode: 'pong-versus', winScore, powerupsEnabled };
      case 'breakout':
        return { mode: 'breakout', powerupsEnabled };
      default:
        return { mode: selectedMode, powerupsEnabled };
    }
  };

  const getModeDisplayName = (): string => {
    switch (selectedMode) {
      case 'pong-solo':
        return 'Pong: Solo';
      case 'pong-versus':
        return 'Pong: Versus';
      case 'breakout':
        return 'Breakout';
      default:
        return '';
    }
  };

  const showWinScore = selectedMode === 'pong-solo' || selectedMode === 'pong-versus';
  const showAiDifficulty = selectedMode === 'pong-solo';

  return (
    <div className="settings-panel">
      <h2 className="settings-panel__title">{getModeDisplayName()}</h2>

      {showWinScore && (
        <div className="form-group">
          <label className="form-label" htmlFor="win-score">
            Win Score
          </label>
          <input
            id="win-score"
            className="form-input"
            type="number"
            min={3}
            max={21}
            step={1}
            value={winScore}
            onChange={(e) => setWinScore(parseInt(e.target.value, 10))}
          />
        </div>
      )}

      {showAiDifficulty && (
        <div className="form-group">
          <label className="form-label">AI Difficulty</label>
          <div className="segmented">
            {(['easy', 'normal', 'hard'] as AIDifficultyPreset[]).map((level) => (
              <button
                key={level}
                className={`segmented__btn${aiDifficulty === level ? ' segmented__btn--active' : ''}`}
                onClick={() => setAiDifficulty(level)}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="form-group">
        <label className="toggle">
          <input
            type="checkbox"
            checked={powerupsEnabled}
            onChange={(e) => setPowerupsEnabled(e.target.checked)}
          />
          Powerups (Coming Soon)
        </label>
      </div>

      {errors.length > 0 && (
        <div>
          {errors.map((err) => (
            <span key={err} className="error-message">
              {err}
            </span>
          ))}
        </div>
      )}

      <div className="settings-panel__actions">
        <button className="btn" onClick={goToMenu}>
          Back
        </button>
        <button className="btn btn--primary" onClick={handleStart}>
          Start
        </button>
      </div>
    </div>
  );
}

export default SettingsPanel;
