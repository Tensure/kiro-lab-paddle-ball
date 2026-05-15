/** All named audio cues the game can trigger */
export type AudioEventName =
  | 'audio:paddle-hit'
  | 'audio:wall-bounce'
  | 'audio:brick-break'
  | 'audio:score-point'
  | 'audio:life-loss'
  | 'audio:powerup-pickup'
  | 'audio:powerup-expire'
  | 'audio:pause'
  | 'audio:win'
  | 'audio:loss';
