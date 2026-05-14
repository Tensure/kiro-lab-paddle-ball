---
inclusion: always
---

# Security

Apply these practices across all specs and implementation work.

## Dependency Management

- Use exact versions for core dependencies (`react`, `react-dom`, `phaser`) in `package.json`.
- Commit `package-lock.json` to ensure reproducible installs across environments.
- Run `npm audit` before closing any spec. Fix critical and high severity findings before merging.
- Prefer well-known, actively maintained packages. Flag unfamiliar or low-download-count packages for review.
- Do not add dependencies for trivial functionality that can be implemented in a few lines.

## Content Security Policy

Include a Content-Security-Policy meta tag in `index.html`:

- `default-src 'self'`
- `script-src 'self'` (no inline scripts; Vite handles module loading)
- `style-src 'self' 'unsafe-inline'` (Phaser injects inline styles for canvas sizing)
- `img-src 'self' data: blob:` (programmatic textures may use data URIs or blobs)
- `media-src 'self' blob:` (Web Audio buffers use blob URIs)
- `connect-src 'self'` (no external API calls in v1)

Adjust only when a specific spec requires it, and document the reason in that spec's design.

## Input Handling

- Sanitize any user-provided text before rendering in the DOM (React handles this by default for JSX expressions, but be cautious with `dangerouslySetInnerHTML`).
- Do not use `dangerouslySetInnerHTML` unless explicitly justified in a spec-local ADR.
- Keyboard input handlers should use `event.preventDefault()` only for keys the game consumes, to avoid breaking browser accessibility shortcuts.

## Event Bridge

- The EventBridge is internal-only. Do not expose it to `window` or any global scope.
- Components subscribing to the EventBridge must unsubscribe in their cleanup function (`useEffect` return) to prevent listener leaks.
- Scenes must call `removeAllListeners()` or unsubscribe individual handlers during scene shutdown to prevent stale references.

## Storage

- Do not store sensitive data in `localStorage` or `sessionStorage`.
- Settings persistence (if implemented) should store only non-sensitive preferences: volume level, selected mode, win score, difficulty.
- Do not store tokens, credentials, or user-identifying information client-side.

## Build and Deploy

- Production builds should not include source maps in publicly deployed artifacts unless explicitly needed for error reporting.
- Do not embed API keys, secrets, or credentials in client-side code.
- The `dist/` output should contain only static assets. No server-side code or configuration files should leak into the bundle.

## Third-Party Code

- Phaser is the only large third-party runtime dependency. Keep it updated within the v3.x line for security patches.
- Do not load scripts from CDNs at runtime. All dependencies should be bundled via Vite.
- If a future spec requires external resources (fonts, analytics, error reporting), document the addition in a spec-local ADR with a security impact note.

## Secrets and Environment Variables

- Use `.env` files only for non-secret build-time configuration (e.g., feature flags).
- Never commit `.env` files containing secrets. Add `.env*.local` to `.gitignore`.
- This project has no backend and no secrets in v1. If a future spec introduces server communication, revisit this section.

## Review Checklist

When reviewing implementation for security:

1. No new dependencies without justification.
2. No open version ranges on core packages.
3. No `dangerouslySetInnerHTML` without ADR.
4. No global exposure of internal modules.
5. No inline event handlers constructed from dynamic strings.
6. Listener cleanup verified for all subscriptions.
7. CSP not weakened without documented reason.
8. `npm audit` shows no critical or high findings.
