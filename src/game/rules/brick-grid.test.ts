import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { generateBrickGrid, type BrickGridConfig, type BrickDescriptor } from './brick-grid';

describe('brick-grid', () => {
  const standardConfig: BrickGridConfig = {
    rows: 3,
    columns: 5,
    playAreaWidth: 800,
    playAreaHeight: 600,
    topOffset: 50,
    padding: 4,
  };

  describe('unit tests', () => {
    it('standard grid (3 rows × 5 columns) produces 15 bricks', () => {
      const bricks = generateBrickGrid(standardConfig);
      expect(bricks).toHaveLength(15);
    });

    it('zero rows returns empty array', () => {
      const bricks = generateBrickGrid({ ...standardConfig, rows: 0 });
      expect(bricks).toEqual([]);
    });

    it('zero columns returns empty array', () => {
      const bricks = generateBrickGrid({ ...standardConfig, columns: 0 });
      expect(bricks).toEqual([]);
    });

    it('negative values return empty array', () => {
      expect(generateBrickGrid({ ...standardConfig, rows: -1 })).toEqual([]);
      expect(generateBrickGrid({ ...standardConfig, columns: -3 })).toEqual([]);
      expect(generateBrickGrid({ ...standardConfig, rows: -2, columns: -1 })).toEqual([]);
    });

    it('all bricks have positive width and height', () => {
      const bricks = generateBrickGrid(standardConfig);
      for (const brick of bricks) {
        expect(brick.width).toBeGreaterThan(0);
        expect(brick.height).toBeGreaterThan(0);
      }
    });
  });

  describe('property tests', () => {
    // Generator for valid BrickGridConfig
    const validConfigArb = fc.record({
      rows: fc.integer({ min: 1, max: 20 }),
      columns: fc.integer({ min: 1, max: 20 }),
      playAreaWidth: fc.integer({ min: 100, max: 1000 }),
      playAreaHeight: fc.integer({ min: 100, max: 1000 }),
      topOffset: fc.integer({ min: 0, max: 100 }),
      padding: fc.integer({ min: 1, max: 10 }),
    });

    function bricksOverlap(a: BrickDescriptor, b: BrickDescriptor): boolean {
      const aRight = a.x + a.width;
      const aBottom = a.y + a.height;
      const bRight = b.x + b.width;
      const bBottom = b.y + b.height;

      return !(aRight <= b.x || a.x >= bRight || aBottom <= b.y || a.y >= bBottom);
    }

    /**
     * Feature: shared-types-and-rules, Property 4: Brick grid no-overlap
     *
     * For valid configs (positive rows 1-20, cols 1-20, area 100-1000, offset 0-100, padding 1-10),
     * no two bricks overlap
     *
     * **Validates: Requirements 9.3**
     */
    it('property 4: no two bricks overlap', () => {
      fc.assert(
        fc.property(validConfigArb, (config) => {
          const bricks = generateBrickGrid(config);
          for (let i = 0; i < bricks.length; i++) {
            for (let j = i + 1; j < bricks.length; j++) {
              if (bricksOverlap(bricks[i], bricks[j])) {
                return false;
              }
            }
          }
          return true;
        }),
        { numRuns: 100 },
      );
    });

    /**
     * Feature: shared-types-and-rules, Property 5: Brick grid fits bounds
     *
     * For valid configs, every brick fits within bounds
     *
     * **Validates: Requirements 9.4**
     */
    it('property 5: every brick fits within bounds', () => {
      fc.assert(
        fc.property(validConfigArb, (config) => {
          const bricks = generateBrickGrid(config);
          for (const brick of bricks) {
            if (brick.x < 0) return false;
            if (brick.y < config.topOffset) return false;
            if (brick.x + brick.width > config.playAreaWidth) return false;
            if (brick.y + brick.height > config.playAreaHeight) return false;
          }
          return true;
        }),
        { numRuns: 100 },
      );
    });

    /**
     * Feature: shared-types-and-rules, Property 6: Brick grid correct count
     *
     * For valid configs, result.length === rows × columns
     *
     * **Validates: Requirements 9.5, 9.2**
     */
    it('property 6: result length equals rows × columns', () => {
      fc.assert(
        fc.property(validConfigArb, (config) => {
          const bricks = generateBrickGrid(config);
          return bricks.length === config.rows * config.columns;
        }),
        { numRuns: 100 },
      );
    });
  });
});
