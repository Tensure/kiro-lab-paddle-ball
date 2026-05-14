# ADR-002: Validation Error Representation

## Status

Accepted

## Context

The settings validator needs to communicate success or failure to callers. Settings validation failures are expected scenarios (user provides incomplete or out-of-range values), not exceptional conditions. We need a pattern that:

1. Keeps the validator pure (no thrown exceptions as control flow).
2. Forces callers to handle both success and failure paths.
3. Provides actionable error details (which fields are missing/invalid).
4. Works well with TypeScript's type narrowing.

## Options Considered

### Option A: Throw exceptions

```typescript
function validateSettings(input: unknown): MatchSettings {
  if (!input.mode) throw new ValidationError('Missing mode');
  // ...
  return settings;
}
```

**Rejected because:**
- Exceptions are for unexpected failures, not expected user-input validation.
- Callers can forget to catch — no compile-time enforcement.
- Breaks purity: throwing is a side effect.
- Stack traces are expensive and unnecessary for validation.

### Option B: Return `null` on failure

```typescript
function validateSettings(input: unknown): MatchSettings | null;
```

**Rejected because:**
- No error details — caller doesn't know what went wrong.
- `null` doesn't carry information about which fields are missing.
- Harder to provide good UX (can't show specific error messages).

### Option C: Tagged union result type (chosen)

```typescript
type ValidationResult =
  | { readonly valid: true; readonly settings: MatchSettings }
  | { readonly valid: false; readonly errors: readonly string[] };
```

## Decision

Use a tagged union (discriminated on `valid: boolean`) that carries either the validated settings or an array of error messages. This is sometimes called a "Result type" pattern.

## Consequences

### Positive

- Pure: no exceptions, no side effects.
- TypeScript narrows: after checking `result.valid`, the compiler knows which branch you're in.
- Actionable errors: the `errors` array tells callers exactly what's wrong.
- Composable: multiple validation steps can accumulate errors before returning.
- Callers are forced to handle both cases (can't accidentally use `settings` without checking `valid`).

### Negative

- Slightly more verbose than a simple return type — callers must destructure or check `valid`.
- Error messages are strings rather than structured error codes. For a game settings validator this is sufficient; a larger system might want error codes.

### Risks

- If error reporting needs become complex (i18n, nested field paths), the string array may need to evolve into structured error objects. Mitigated by keeping the validator's scope small and the error messages simple.
