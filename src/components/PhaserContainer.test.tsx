import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';

const destroyMock = vi.fn();
let constructorCallCount = 0;

vi.mock('phaser', () => {
  class MockGame {
    destroy: ReturnType<typeof vi.fn>;
    constructor() {
      constructorCallCount++;
      this.destroy = destroyMock;
    }
  }
  return {
    default: { Game: MockGame, AUTO: 0 },
    Game: MockGame,
    AUTO: 0,
  };
});

import PhaserContainer from './PhaserContainer';

describe('PhaserContainer', () => {
  beforeEach(() => {
    constructorCallCount = 0;
    vi.clearAllMocks();
    cleanup();
  });

  it('mounting creates exactly one Phaser.Game instance', () => {
    render(<PhaserContainer />);
    expect(constructorCallCount).toBe(1);
  });

  it('unmounting calls game.destroy(true)', () => {
    const { unmount } = render(<PhaserContainer />);
    unmount();
    expect(destroyMock).toHaveBeenCalledWith(true);
  });

  it('re-render does not create a second game instance', () => {
    const { rerender } = render(<PhaserContainer />);
    rerender(<PhaserContainer />);
    expect(constructorCallCount).toBe(1);
  });
});
