---
name: phaser-react-implementation
description: Implement React TypeScript Phaser 3 paddle arcade features while preserving scene, system, and pure-rule boundaries. Use when coding gameplay, UI shell, audio, settings, or powerups.
---

# Phaser React Implementation

Use this skill when implementing code for the rewrite.

Implementation rules:

1. Read `.kiro/steering/architecture.md` and `.kiro/steering/phaser-typescript.md`.
2. Identify whether the change belongs in React UI, Phaser scene code, shared runtime systems, or pure rules.
3. Put deterministic logic in pure TypeScript where practical.
4. Keep Phaser lifecycle and object mutation inside scenes/systems.
5. Keep React state out of the Phaser frame loop.
6. Use typed event payloads between React and Phaser.
7. Add focused tests for pure rules and React settings behavior.
8. Keep visuals programmatic and audio synthesized for v1.

Use `references/module-map.md` when choosing file locations.

