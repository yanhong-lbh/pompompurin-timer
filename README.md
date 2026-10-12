# Pompom Time 🍮

A cozy Pompompurin fan countdown timer, with four illustrated worlds: Pudding Café, Strawberry Picnic, Matcha Garden, and Moonlight Nap.

**[Open Pompom Time](https://yanhong-lbh.github.io/pompompurin-timer/)**

- Quick 5, 15, 25, and 50 minute timers, or a custom duration from 1 second to 99 hours.
- Pause, resume, reset, optional completion chime, and fullscreen.
- A deadline-based countdown that stays accurate when the tab is in the background. The timer, theme, sound preference, and optional intention are saved locally for refreshes.
- Responsive layout, keyboard controls, accessible button labels, and reduced-motion support.

## Use

Serve the directory with any static web server, for example `python3 -m http.server 8000`, then open `http://localhost:8000`. No build or dependencies required. Google Fonts is optional; the interface falls back to local fonts.

Press **Space** to start/pause, **R** to reset, or **F** for fullscreen when not editing a field or focusing a control. Changing a preset or custom duration resets the countdown.

The chime needs an interaction with the page to enable audio. Browser or device suspension can delay the completion sound until the page wakes, but elapsed time is preserved. Keep the page open to hear it. Closing the page does not schedule a system alarm.

## Development

Run `node --test timer.test.js` (Node 20+). The app is plain HTML, CSS, SVG, and JavaScript modules. `timer.js` owns the countdown state; `app.js` connects it to the page.

For GitHub Pages, publish the `main` branch from `/ (root)` under **Settings → Pages**.

## About

Unofficial fan project, not affiliated with or endorsed by Sanrio. Pompompurin and the character artwork © SANRIO CO., LTD.

The character in every theme, thumbnail, and favicon uses Sanrio's [official Pompompurin portrait](https://www.sanrio.co.jp/wp-content/uploads/2022/06/list-pompompurin.png) from the [official character page](https://www.sanrio.co.jp/characters/pompompurin/). Each SVG embeds the original PNG bytes unchanged. The surrounding decorative scenes and timer interface were created for this fan project. This attribution does not imply a license or endorsement from Sanrio.

No analytics or server-side storage; preferences stay in your browser.
