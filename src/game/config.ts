import Phaser from 'phaser';
import PlaceholderScene from './scenes/PlaceholderScene';

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scene: [PlaceholderScene],
};

export default gameConfig;
