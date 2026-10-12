# Pompom Time 🍮

A cozy Pompompurin fan countdown timer with ten illustrated worlds. Six adventures feature different official Pompompurin designs: Space Mission, Tea Party, Onsen Retreat, Sushi Break, Pillow Fort, and Purin’s Art Studio. The original Pudding Café, Strawberry Picnic, Matcha Garden, and Moonlight Nap are still available in the classics collection.

**[Open Pompom Time](https://yanhong-lbh.github.io/pompompurin-timer/)**

- Quick 5, 15, 25, and 50 minute timers, or a custom duration from 1 second to 99 hours.
- Pause, resume, reset, optional completion chime, and fullscreen.
- A deadline-based countdown that stays accurate when the tab is in the background. The timer, theme, sound preference, and optional intention are saved locally for refreshes.
- Responsive layout, keyboard controls, accessible button labels, and reduced-motion support.
- A large, easy-to-read countdown beside one official character scene, with timer controls first on mobile.

## Use

Serve the directory with any static web server, for example `python3 -m http.server 8000`, then open `http://localhost:8000`. No build or dependencies required. Google Fonts is optional; the interface falls back to local fonts.

Press **Space** to start/pause, **R** to reset, or **F** for fullscreen when not editing a field or focusing a control. Changing a preset or custom duration resets the countdown.

The chime needs an interaction with the page to enable audio. Browser or device suspension can delay the completion sound until the page wakes, but elapsed time is preserved. Keep the page open to hear it. Closing the page does not schedule a system alarm.

## Development

Run `node --test timer.test.js` (Node 20+). The app is plain HTML, CSS, SVG, and JavaScript modules. `timer.js` owns the countdown state, `themes.js` holds the theme catalog and artwork URLs, and `app.js` connects them to the page.

For GitHub Pages, publish the `main` branch from `/ (root)` under **Settings → Pages**.

## About

Unofficial fan project, not affiliated with or endorsed by Sanrio. Pompompurin and the character artwork © SANRIO CO., LTD.

The six adventure themes display the original artwork from Sanrio without redrawing or recoloring the characters. The interface zooms and frames each image around Pompompurin. Images load directly from Sanrio, so these themes need an internet connection and depend on the source images remaining available.

| Theme | Original artwork | Official source page |
| --- | --- | --- |
| Space Mission | [Astronaut Pompompurin](https://pompompurin30th.sanrio.co.jp/img/gallery/gallery_13_large.jpg) | [30th anniversary gallery](https://pompompurin30th.sanrio.co.jp/) |
| Tea Party | [Pompompurin’s tea party](https://pompompurin30th.sanrio.co.jp/img/gallery/gallery_06_large.jpg) | [30th anniversary gallery](https://pompompurin30th.sanrio.co.jp/) |
| Onsen Retreat | [Pompompurin’s hot spring trip](https://pompompurin30th.sanrio.co.jp/img/gallery/gallery_20_large.jpg) | [30th anniversary gallery](https://pompompurin30th.sanrio.co.jp/) |
| Sushi Break | [Pompompurin and friends as sushi](https://pompompurin30th.sanrio.co.jp/img/gallery/gallery_23_large.jpg) | [30th anniversary gallery](https://pompompurin30th.sanrio.co.jp/) |
| Pillow Fort | [November 2023 wallpaper](https://www.sanrio.co.jp/wp-content/uploads/2023/11/wallpaper202311-3.jpg) | [Team Purin wallpaper collection](https://www.sanrio.co.jp/specialsite/team-purin/wallpaper/) |
| Purin’s Art Studio | [June 2023 wallpaper](https://www.sanrio.co.jp/wp-content/uploads/2023/06/wallpaper202306-4.jpg) | [Team Purin wallpaper collection](https://www.sanrio.co.jp/specialsite/team-purin/wallpaper/) |

The four classic themes and favicon use Sanrio's [official Pompompurin portrait](https://www.sanrio.co.jp/wp-content/uploads/2022/06/list-pompompurin.png) from the [official character page](https://www.sanrio.co.jp/characters/pompompurin/). Each SVG embeds the original PNG bytes unchanged. The surrounding decorative scenes and timer interface were created for this fan project. This attribution does not imply a license or endorsement from Sanrio.

No analytics or server-side storage; preferences stay in your browser.
