import Phaser from 'phaser';
import eventBridge from '../systems/EventBridge';

/**
 * Minimal scene that proves Phaser boots and communicates
 * through the EventBridge. Will be replaced by real scenes.
 */
export default class PlaceholderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PlaceholderScene' });
  }

  create(): void {
    eventBridge.emit('placeholder:ping', { timestamp: Date.now() });
  }
}
