import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

interface PhaserContainerProps {
  config?: Partial<Phaser.Types.Core.GameConfig>;
}

/**
 * React component that owns the Phaser game lifecycle.
 * Creates a single Phaser.Game on mount, destroys it on unmount.
 * Ref guard prevents double-instantiation in React 19 strict mode.
 */
function PhaserContainer({ config }: PhaserContainerProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const configRef = useRef(config);

  useEffect(() => {
    if (gameRef.current) return;

    const game = new Phaser.Game({
      ...configRef.current,
      parent: containerRef.current ?? undefined,
    });
    gameRef.current = game;

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div ref={containerRef} />;
}

export default PhaserContainer;
