import Phaser from 'phaser';
import PlaceholderScene from './scenes/PlaceholderScene';
import PongScene from './scenes/PongScene';

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scene: [PlaceholderScene, PongScene],
};

export default gameConfig;
