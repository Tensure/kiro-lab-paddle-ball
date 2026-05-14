# Spec Checklist

Before marking a spec update ready:

- The affected mode is explicit: `Pong: Solo`, `Pong: Versus`, `Breakout`, or shared.
- Keyboard controls are documented if input changes.
- Powerup behavior says whether powerups must be enabled.
- Audio/visual behavior is testable or described as polish.
- Settings say whether they are pre-match only or may change mid-match.
- Requirements avoid implementation-only language.
- Acceptance criteria use EARS notation and are observable.
- Design identifies React, Phaser, shared-system, and pure-rule ownership.
- Tasks include verification steps.
