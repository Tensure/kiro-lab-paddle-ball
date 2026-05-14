/** Breakout match state */
export interface BreakoutState {
  readonly lives: number;
  readonly bricksRemaining: number;
  readonly score: number;
}

/** Match status */
export type MatchStatus = 'in-progress' | 'win' | 'loss';

export const STARTING_LIVES = 3;

/** Creates initial breakout state */
export function createInitialState(totalBricks: number): BreakoutState {
  return { lives: STARTING_LIVES, bricksRemaining: totalBricks, score: 0 };
}

/** Decrements lives by 1. Never goes below 0. */
export function loseLife(state: BreakoutState): BreakoutState {
  return {
    ...state,
    lives: Math.max(0, state.lives - 1),
  };
}

/** Decrements bricks remaining and adds points to score */
export function breakBrick(state: BreakoutState, points: number): BreakoutState {
  return {
    ...state,
    bricksRemaining: state.bricksRemaining - 1,
    score: state.score + points,
  };
}

/** Determines current match status */
export function getMatchStatus(state: BreakoutState): MatchStatus {
  if (state.lives === 0) {
    return 'loss';
  }
  if (state.bricksRemaining === 0) {
    return 'win';
  }
  return 'in-progress';
}
