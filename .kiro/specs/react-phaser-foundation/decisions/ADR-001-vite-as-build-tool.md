# ADR-001: Vite as Build Tool

## Status

Accepted

## Context

The project needs a build tool that supports:
- React with JSX/TSX transformation
- TypeScript compilation
- Hot module replacement for development
- Production bundling with tree-shaking
- Compatibility with Phaser 3 (a large library that benefits from efficient bundling)

The official Phaser React TypeScript template uses Vite, establishing it as the community-recommended approach.

## Options Considered

### Vite

- Native ES module dev server with near-instant HMR
- First-class TypeScript and React support via `@vitejs/plugin-react`
- Rollup-based production builds with good tree-shaking
- Official Phaser template uses Vite
- Minimal configuration needed for this stack
- Active ecosystem with frequent updates

### Create React App (CRA)

- Webpack-based, significantly slower dev startup and HMR
- Officially deprecated by the React team (2023)
- Heavy default configuration that's hard to customize
- No longer recommended for new projects
- **Rejected:** Deprecated, slow, poor DX compared to Vite.

### Webpack (manual)

- Maximum configurability
- Mature ecosystem with extensive plugin support
- Significantly more boilerplate configuration required
- Slower dev server and HMR compared to Vite
- **Rejected:** Unnecessary complexity for this project's needs. Vite provides equivalent output with less configuration.

### Parcel

- Zero-config philosophy
- Good TypeScript support
- Smaller ecosystem than Vite
- Less community adoption for React + Phaser projects
- Occasional issues with large libraries like Phaser
- **Rejected:** Less proven with Phaser, smaller community, fewer escape hatches when customization is needed.

## Decision

Use Vite with `@vitejs/plugin-react` as the build tool.

## Consequences

**Positive outcomes:**
- Fast development feedback loop (sub-second HMR)
- Minimal configuration — most defaults work out of the box
- Alignment with official Phaser template reduces integration risk
- Modern ESM-first approach aligns with current ecosystem direction
- Easy to extend with additional Vite plugins as needs grow

**Negative tradeoffs:**
- Rollup-based production builds have slightly different behavior than the ESBuild-based dev server (rare edge cases)
- Less mature than Webpack for complex custom build pipelines (not needed here)

**Risks:**
- If Phaser 4 changes its bundling requirements, Vite config may need updates (mitigated: Phaser team maintains Vite templates)
