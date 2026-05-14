/** Configuration for brick grid generation */
export interface BrickGridConfig {
  readonly rows: number;
  readonly columns: number;
  readonly playAreaWidth: number;
  readonly playAreaHeight: number;
  readonly topOffset: number;
  readonly padding: number;
}

/** A single brick descriptor */
export interface BrickDescriptor {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Generates a grid of non-overlapping brick descriptors that fit within bounds.
 * Returns empty array for zero or negative rows/columns.
 */
export function generateBrickGrid(config: BrickGridConfig): BrickDescriptor[] {
  const { rows, columns, playAreaWidth, playAreaHeight, topOffset, padding } = config;

  if (rows <= 0 || columns <= 0) {
    return [];
  }

  const brickWidth = (playAreaWidth - padding * (columns + 1)) / columns;
  const brickHeight = (playAreaHeight - topOffset - padding * (rows + 1)) / rows;

  const bricks: BrickDescriptor[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      bricks.push({
        x: padding + col * (brickWidth + padding),
        y: topOffset + padding + row * (brickHeight + padding),
        width: brickWidth,
        height: brickHeight,
      });
    }
  }

  return bricks;
}
