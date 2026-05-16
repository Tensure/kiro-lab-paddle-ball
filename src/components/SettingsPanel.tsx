import { useState } from 'react';
import { useAppStore } from '../app/store';
import { validateSettings } from '../game/rules/settings-validator';
import type { AIDifficultyPreset } from '../game/types/modes';
import type { BallSpeedPreset, PaddleSizePreset, SpeedIncreasePreset, BrickDensityPreset, StartingLives } from '../game/types/settings';

function SettingsPanel(): React.JSX.Element {
  const selectedMode = useAppStore((s) => s.selectedMode);
  const winScore = useAppStore((s) => s.winScore);
  const aiDifficulty = useAppStore((s) => s.aiDifficulty);
  const powerupsEnabled = useAppStore((s) => s.powerupsEnabled);
  const ballSpeedPreset = useAppStore((s) => s.ballSpeedPreset);
  const paddleSizePreset = useAppStore((s) => s.paddleSizePreset);
  const speedIncreasePreset = useAppStore((s) => s.speedIncreasePreset);
  const startingLives = useAppStore((s) => s.startingLives);
  const brickDensity = useAppStore((s) => s.brickDensity);
  const setWinScore = useAppStore((s) => s.setWinScore);
  const setAiDifficulty = useAppStore((s) => s.setAiDifficulty);
  const setPowerupsEnabled = useAppStore((s) => s.setPowerupsEnabled);
  const setBallSpeedPreset = useAppStore((s) => s.setBallSpeedPreset);
  const setPaddleSizePreset = useAppStore((s) => s.setPaddleSizePreset);
  const setSpeedIncreasePreset = useAppStore((s) => s.setSpeedIncreasePreset);
  const setStartingLives = useAppStore((s) => s.setStartingLives);
  const setBrickDensity = useAppStore((s) => s.setBrickDensity);
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
        return {
          mode: 'pong-solo',
          winScore,
          aiDifficulty,
          powerupsEnabled,
          ballSpeedPreset,
          paddleSizePreset,
          speedIncreasePreset,
        };
      case 'pong-versus':
        return {
          mode: 'pong-versus',
          winScore,
          powerupsEnabled,
          ballSpeedPreset,
          paddleSizePreset,
          speedIncreasePreset,
        };
      case 'breakout':
        return {
          mode: 'breakout',
          powerupsEnabled,
          ballSpeedPreset,
          paddleSizePreset,
          speedIncreasePreset,
          startingLives,
          brickDensity,
        };
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

  const isPong = selectedMode === 'pong-solo' || selectedMode === 'pong-versus';
  const isBreakout = selectedMode === 'breakout';
  const showAiDifficulty = selectedMode === 'pong-solo';

  return (
    <div className="settings-panel">
      <h2 className="settings-panel__title">{getModeDisplayName()}</h2>

      {isPong && (
        <>
          <h3>Match Rules</h3>

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

          <h3>Feel</h3>

          <div className="form-group">
            <label className="form-label">Ball Speed</label>
            <div className="segmented">
              {(['slow', 'normal', 'fast'] as BallSpeedPreset[]).map((opt) => (
                <button
                  key={opt}
                  className={`segmented__btn${ballSpeedPreset === opt ? ' segmented__btn--active' : ''}`}
                  onClick={() => setBallSpeedPreset(opt)}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Paddle Size</label>
            <div className="segmented">
              {(['small', 'normal', 'large'] as PaddleSizePreset[]).map((opt) => (
                <button
                  key={opt}
                  className={`segmented__btn${paddleSizePreset === opt ? ' segmented__btn--active' : ''}`}
                  onClick={() => setPaddleSizePreset(opt)}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Ball Speed Increase</label>
            <div className="segmented">
              {(['off', 'gentle', 'aggressive'] as SpeedIncreasePreset[]).map((opt) => (
                <button
                  key={opt}
                  className={`segmented__btn${speedIncreasePreset === opt ? ' segmented__btn--active' : ''}`}
                  onClick={() => setSpeedIncreasePreset(opt)}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {isBreakout && (
        <>
          <h3>Match Rules</h3>

          <div className="form-group">
            <label className="form-label">Starting Lives</label>
            <div className="segmented">
              {([1, 3, 5] as StartingLives[]).map((opt) => (
                <button
                  key={opt}
                  className={`segmented__btn${startingLives === opt ? ' segmented__btn--active' : ''}`}
                  onClick={() => setStartingLives(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <h3>Feel</h3>

          <div className="form-group">
            <label className="form-label">Ball Speed</label>
            <div className="segmented">
              {(['slow', 'normal', 'fast'] as BallSpeedPreset[]).map((opt) => (
                <button
                  key={opt}
                  className={`segmented__btn${ballSpeedPreset === opt ? ' segmented__btn--active' : ''}`}
                  onClick={() => setBallSpeedPreset(opt)}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Paddle Size</label>
            <div className="segmented">
              {(['small', 'normal', 'large'] as PaddleSizePreset[]).map((opt) => (
                <button
                  key={opt}
                  className={`segmented__btn${paddleSizePreset === opt ? ' segmented__btn--active' : ''}`}
                  onClick={() => setPaddleSizePreset(opt)}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Brick Density</label>
            <div className="segmented">
              {(['sparse', 'normal', 'dense'] as BrickDensityPreset[]).map((opt) => (
                <button
                  key={opt}
                  className={`segmented__btn${brickDensity === opt ? ' segmented__btn--active' : ''}`}
                  onClick={() => setBrickDensity(opt)}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </>
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
