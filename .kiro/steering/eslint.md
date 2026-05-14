---
inclusion: fileMatch
fileMatchPattern: ["eslint.config.*", "src/**/*.ts", "src/**/*.tsx"]
---

# ESLint Guidance

Use ESLint with flat config format (`eslint.config.js`) for all TypeScript and React linting.

## Configuration

- Use `typescript-eslint` for TypeScript-aware rules.
- Use `eslint-plugin-react-hooks` for React hooks rules (exhaustive deps, rules of hooks).
- Use `eslint-plugin-react-refresh` for fast refresh compatibility checks.
- Target `src/` directory only. Do not lint config files, build output, or node_modules.

## Required Rules

Enable at minimum:

- `@typescript-eslint/no-unused-vars` — error for unused variables (allow underscore-prefixed).
- `@typescript-eslint/explicit-module-boundary-types` — warn or error on exported functions missing return types.
- `@typescript-eslint/no-explicit-any` — warn to discourage `any` usage.
- `react-hooks/rules-of-hooks` — error.
- `react-hooks/exhaustive-deps` — warn.

## Style Preferences

- Do not use Prettier as an ESLint plugin. If formatting is needed, run it separately.
- Prefer TypeScript-aware rules over base ESLint equivalents (e.g., use `@typescript-eslint/no-unused-vars` instead of `no-unused-vars`).
- Do not enable stylistic rules that conflict with common formatter output.

## When Adding Rules

- New rules should not break existing passing code without a migration task.
- If a rule requires widespread changes, add it as a warning first and create a follow-up task to fix violations.
- Document rule additions in the PR description.

## Suppression Policy

- Prefer fixing the issue over suppressing the rule.
- If suppression is necessary, use inline `// eslint-disable-next-line` with a comment explaining why.
- Do not use file-level or directory-level disables unless justified in a spec-local ADR.
- Never disable `react-hooks/rules-of-hooks`.

## Integration with Validation

- `npm run lint` runs `eslint src/` and must exit with zero errors and zero warnings.
- Lint runs as part of the Definition of Done for every task.
- The lint-on-save Kiro hook triggers ESLint on `.ts` and `.tsx` file edits.
