/** Immutable score state */
export interface PongScores {
  readonly left: number;
  readonly right: number;
}

/** Which edge the ball exited */
export type ExitEdge = 'left' | 'right';

/** Result of awarding a point */
export interface ScoreResult {
  readonly scores: PongScores;
  readonly nextServeDirection: 'left' | 'right';
}

/**
 * Awards a point based on which edge the ball exited.
 * Ball exiting left → right player scores.
 * Ball exiting right → left player scores.
 * Next serve goes toward the player who lost the point (the exit edge).
 */
export function awardPoint(current: PongScores, exitEdge: ExitEdge): ScoreResult {
  if (exitEdge === 'left') {
    return {
      scores: { left: current.left, right: current.right + 1 },
      nextServeDirection: 'left',
    };
  }

  return {
    scores: { left: current.left + 1, right: current.right },
    nextServeDirection: 'right',
  };
}
