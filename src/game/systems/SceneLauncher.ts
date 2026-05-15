import type { SceneLaunchPayload } from '../types/payload';

/**
 * Module-level payload storage for reliable scene initialization.
 * Eliminates timing dependency between React game creation and Phaser scene init.
 *
 * GameView sets the payload before creating the Phaser game.
 * PongScene reads it in init() as the primary data source.
 */
let currentPayload: SceneLaunchPayload | null = null;

export function setLaunchPayload(payload: SceneLaunchPayload): void {
  currentPayload = payload;
}

export function getLaunchPayload(): SceneLaunchPayload | null {
  return currentPayload;
}

export function clearLaunchPayload(): void {
  currentPayload = null;
}
