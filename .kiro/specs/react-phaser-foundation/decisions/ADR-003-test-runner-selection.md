# ADR-003: Test Runner Selection

## Status

Accepted

## Context

The project needs a test runner that supports:
- TypeScript test files without separate compilation step
- React component testing with DOM environment (jsdom or happy-dom)
- Property-based testing via fast-check integration
- Fast execution for developer feedback
- Compatibility with Vite's module resolution and plugin system
- Watch mode for development, single-run mode for CI

## Options Considered

### Vitest (chosen)

- Built by the Vite team, shares Vite's config and transform pipeline
- Native TypeScript support via Vite's esbuild transform
- Compatible with Jest's `expect` API (low migration friction)
- Built-in support for multiple environments (node, jsdom, happy-dom)
- Fast execution via Vite's module graph and HMR-aware caching
- Works with fast-check out of the box (standard imports)
- Single config file can extend `vite.config.ts`
- Active development, growing ecosystem

### Jest

- Industry standard, massive ecosystem
- Requires additional configuration for TypeScript (`ts-jest` or `@swc/jest`)
- Requires separate module resolution config that may conflict with Vite's
- Slower startup due to transform overhead
- `jest.config` is separate from Vite config — two systems to maintain
- Works with fast-check
- **Rejected:** Requires duplicating module resolution config. Slower than Vitest for Vite-based projects. Two config systems to maintain instead of one.

### Node.js Built-in Test Runner

- Zero dependencies
- Limited ecosystem, no built-in DOM environment
- No watch mode with HMR awareness
- Requires manual TypeScript compilation or loader setup
- No component testing support without significant setup
- **Rejected:** Too minimal for a React + Phaser project. No DOM environment support. Significant setup overhead for TypeScript.

### Mocha + Chai

- Flexible, mature
- Requires many plugins for TypeScript, DOM, coverage
- No built-in watch mode with Vite integration
- More configuration than Vitest for equivalent functionality
- **Rejected:** Too much assembly required. Vitest provides the same capabilities with less configuration.

## Decision

Use Vitest as the test runner with fast-check as a dev dependency for property-based tests.

Configure Vitest to:
- Use `happy-dom` environment for React component tests (faster than jsdom)
- Run in single-execution mode for CI (`vitest run`)
- Resolve modules using Vite's transform pipeline (shared config)
- Include `src/**/*.test.{ts,tsx}` as test file patterns

## Consequences

**Positive outcomes:**
- Single configuration source — Vitest extends Vite config
- Fast execution with Vite's transform caching
- Familiar Jest-like API reduces learning curve
- Property-based tests with fast-check work without additional plugins
- React component tests supported via happy-dom environment
- Watch mode leverages Vite's module graph for targeted re-runs

**Negative tradeoffs:**
- Smaller ecosystem than Jest (fewer community plugins, though most Jest plugins have Vitest equivalents)
- Vitest is younger than Jest — less battle-tested in large codebases (mitigated: backed by Vite team, widely adopted)

**Risks:**
- If the project later needs a testing feature only available in Jest's ecosystem, migration would require config changes (mitigated: Vitest's Jest-compatible API makes migration straightforward)
- happy-dom may have edge cases where it differs from real browser behavior (mitigated: this spec doesn't test Phaser rendering; component tests focus on lifecycle contracts)
