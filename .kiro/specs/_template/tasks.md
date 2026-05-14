# Implementation Plan

- [ ] 1. Prepare foundation for this spec
  - Identify affected modules and ownership boundaries
  - Create or update spec-local ADRs for significant architectural choices
  - Add or update shared types before implementation where useful
  - Confirm dependencies from previous specs are complete
  - _Requirements: X.Y_

- [ ] 2. Implement core behavior
  - Add the smallest complete behavior slice
  - Keep deterministic logic in pure TypeScript where practical
  - Keep Phaser runtime mutation inside scenes or systems
  - _Requirements: X.Y_

- [ ] 3. Add UI or scene integration
  - Connect React settings or Phaser scene behavior as needed
  - Use typed event payloads across boundaries
  - Preserve keyboard-only gameplay expectations
  - _Requirements: X.Y_

- [ ] 4. Add tests and validation
  - Add or update focused unit tests
  - Add React tests when settings or menu behavior changes
  - Add property-based tests where invariants matter
  - Run available validation commands
  - _Requirements: X.Y_

- [ ] 5. Review delivery readiness
  - Check `.kiro/checklists/task-completion.md`
  - Check steering alignment
  - Confirm required spec-local ADRs are present and current
  - Update docs or specs if durable decisions changed
  - _Requirements: X.Y_

