import { useAppStore } from './store';
import './styles.css';
import ModeSelectionScreen from '../components/ModeSelectionScreen';
import SettingsPanel from '../components/SettingsPanel';
import GameView from '../components/GameView';
import AudioControls from '../components/AudioControls';

function App(): React.JSX.Element {
  const phase = useAppStore((s) => s.phase);

  return (
    <div className="app-shell">
      <AudioControls />
      {phase === 'menu' && <ModeSelectionScreen />}
      {phase === 'settings' && <SettingsPanel />}
      {phase === 'playing' && <GameView />}
    </div>
  );
}

export default App;
