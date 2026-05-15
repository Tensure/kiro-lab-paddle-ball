---
inclusion: fileMatch
fileMatchPattern: ["src/**/*.tsx", "src/**/*.css"]
---

# React UI Guidance

React UI should feel like a focused arcade game interface, not a marketing page.

The first screen should be the playable app shell with mode selection and settings, not a landing page. The game canvas should be the primary visual element once a match starts.

Menus and overlays should support:

- choosing `Pong: Solo`, `Pong: Versus`, or `Breakout`
- configuring Pong win score before match start
- choosing Pong AI difficulty before `Pong: Solo`
- enabling or disabling powerups before match start
- muting and adjusting volume if audio settings are implemented
- pause/resume
- restart match
- return to menu

## GameView Component Responsibilities

The GameView component is the bridge between React and Phaser. When it mounts:

1. Build the `SceneLaunchPayload` from Zustand store state
2. Call `setLaunchPayload(payload)` to store it for the scene
3. Call `audioManager.init()` to start the audio system
4. Create the Phaser game with `postBoot` callback that adds and starts the scene
5. Subscribe to EventBridge events (`score:update`, `match:win`, `match:loss`, `lives:update`) and update the store

When it unmounts:
1. Destroy the Phaser game
2. Call `audioManager.destroy()`

For restart:
- Overlays emit `'scene:restart'` on EventBridge
- The scene subscribes and calls `this.scene.restart()` which re-reads from SceneLauncher
- React resets match data in the store

Do NOT rely on React re-rendering GameView to restart — the Phaser game persists across React renders.

Use compact, readable controls. Prefer:

- segmented controls for mode and difficulty choices
- toggles or checkboxes for binary settings such as powerups and mute
- steppers, sliders, or number inputs for Pong win score
- icon buttons where the action is familiar and an icon library is already available

Do not use visible instructional copy to explain every feature. Labels should be clear enough that the UI is self-evident.

Keep the visual direction clean neon arcade:

- dark neutral background
- high-contrast text
- crisp borders and geometric shapes
- restrained glow and particle accents
- no decorative gradient blobs or generic hero art

Ensure text fits in controls at mobile and desktop widths. Do not scale font sizes with viewport width.

