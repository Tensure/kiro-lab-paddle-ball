import { useState, useEffect } from 'react';
import audioManager from '../game/systems/AudioManager';
import eventBridge from '../game/systems/EventBridge';
import type { AudioState } from '../game/types/events';

function AudioControls(): React.JSX.Element {
  const [muted, setMuted] = useState(() => audioManager.getState().muted);
  const [volume, setVolume] = useState(() => audioManager.getState().volume);

  useEffect(() => {
    const handler = (state: AudioState): void => {
      setMuted(state.muted);
      setVolume(state.volume);
    };
    eventBridge.on('audio:state-change', handler);
    return () => {
      eventBridge.off('audio:state-change', handler);
    };
  }, []);

  const handleMuteToggle = (): void => {
    audioManager.toggleMute();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    audioManager.setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="audio-controls">
      <button
        className={`audio-controls__mute${muted ? ' audio-controls__mute--muted' : ''}`}
        onClick={handleMuteToggle}
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? '🔇' : '🔊'}
      </button>
      <input
        className="volume-slider"
        type="range"
        min={0}
        max={1}
        step={0.1}
        value={volume}
        onChange={handleVolumeChange}
        aria-label="Volume"
      />
    </div>
  );
}

export default AudioControls;
