# What if Intelligence Became as Cheap as Electricity?

A scrollytelling piece submitted to the **CAUSE Student Data Scrollytelling Contest** (causeweb.org/cause/contests/data-scrollytelling).

> **Blind review:** This artifact intentionally contains no author identification anywhere — not in the page, not in the README, not in the repo name, not in code comments, not in meta tags. Author identity is supplied separately on the submission form.

The piece argues, using market-equilibrium reasoning (Jordan, Autor, Acemoglu-Restrepo, Baumol), that as AI commoditizes generic thinking, the parts of human work that *can't* be automated become scarcer — and therefore more valuable.

## Stack

Vanilla HTML + [Scrollama.js](https://github.com/russellsamora/scrollama) + [D3.js v7](https://d3js.org). All CDN imports — no build step, no framework.

Acts 0 (hero cost counter) and 4 (sign-flip timeline) are driven by `onStepProgress` for smooth, continuous animation as the reader scrolls. Act 5 (the two-dial widget) is user-driven via slider inputs. The other acts use discrete `onStepEnter` transitions.

## Argument structure (9 acts, 0–8)

| Act | Title | Role |
|-----|-------|------|
| 0 | Hero / cost collapse | The hook |
| 1 | The Two Camps | Establishes the doom-vs-utopia false binary |
| 2 | The Shock | Where the wave actually lands |
| 3 | The Short-Run Squeeze | Part 1 of the sign flip — displacement effect |
| 4 | The Long-Run Rebound | Part 2 of the sign flip — Baumol + scarcity |
| 5 | The Two Dials | Interactive — when does the flip actually happen? |
| 6 | The Jordan Layer | Why incentives and rules decide who gains |
| 7 | The Spectrum & Close | The full picture; the closing line |
| 8 | Methodology & Sources | Verified vs. illustrative; references |

## Run locally

Any static server works. From this directory:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

or

```bash
npx serve .
```

> Note: opening `index.html` directly via `file://` works in most browsers, but a few CDN/CORS quirks are avoided by serving over HTTP.

## File structure

```
scrollytelling/
├── index.html             single entry point
├── css/
│   └── style.css          all styles
├── js/
│   ├── main.js            scrollama setup + act orchestration
│   ├── data.js            all hard-coded datasets (with classification notes)
│   ├── utils.js           shared helpers (colors, formatters)
│   └── charts/
│       ├── costCurve.js          Act 0 — animated counter (progress-driven)
│       ├── twoCamps.js           Act 1 — doom-vs-utopia split-screen
│       ├── exposureChart.js      Act 2 — exposure pictogram
│       ├── wagePolarization.js   Act 3 — short-run squeeze (wage polarization)
│       ├── signFlipTimeline.js   Act 4 — sign-flip centerpiece (progress-driven)
│       ├── baumolChart.js        Act 4 — supporting Baumol bars
│       ├── twoDials.js           Act 5 — interactive two-dial widget
│       ├── jordanTriangle.js     Act 6 — Jordan triangle + flowchart
│       └── spectrumViz.js        Act 7 — scarcity spectrum bubbles
└── README.md
```

## Deploy

The artifact is a static site — any static host works. Pick the path of least resistance.

### Option 1: GitHub Pages

```bash
git init
git add .
git commit -m "scrollytelling submission"
git branch -M main
git remote add origin git@github.com:<account>/<repo-name>.git
git push -u origin main
```

> **Blind-review note:** the repo name and the GitHub account handle must NOT contain the author's real name or institution. Use a neutral repo name like `ai-cognitive-scarcity` or `intelligence-and-electricity`.

In the GitHub repo: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / root (`/`)**. After ~30 seconds the site is live at `https://<account>.github.io/<repo-name>/`.

### Option 2: Cloudflare Pages

[Recent contest winners have deployed at `*.pages.dev` URLs](https://pages.cloudflare.com).

```bash
# install Wrangler if you don't have it
npm install -g wrangler

# from the scrollytelling/ directory:
wrangler pages deploy . --project-name=<project-name>
```

Or use the Cloudflare Pages dashboard's drag-and-drop interface.

### Option 3: Netlify (drag-and-drop)

Drag the `scrollytelling/` folder onto [app.netlify.com/drop](https://app.netlify.com/drop). Live in seconds.

All paths in the project are relative, so the site works at any subpath.

## Data note

Every dataset is hard-coded in [`js/data.js`](js/data.js) with a **CLASSIFICATION** line stating whether the figures are *verified*, *pattern* (real trend, rounded values), or *illustrative*. The same classification appears in Act 7 of the page itself, in plain language, so the reader sees exactly what is and isn't a point estimate.

There are no external fetches, no CSV loads, no API keys. This is intentional for portability and reproducibility.

## Quotation note

Quotes from M.I. Jordan are short paraphrases of his published positions, clearly attributed. No long verbatim passages are reproduced.

## Quality checklist

- [x] No author / institution / handle identifiers anywhere in the artifact, repo configuration, or meta tags
- [x] Every economics term defined in plain language at first use ("equilibrium" in Act 2, "Baumol cost disease" in Act 4)
- [x] All 7 acts render in Chrome and Firefox
- [x] All chart animations trigger on scroll, not on load
- [x] Mobile layout works at 375px
- [x] No console errors
- [x] Custom SVG for Jordan's triangle
- [x] Cost counter animates continuously $60 → $0.08 (not stepped)
- [x] Supply–demand panels animate smoothly with scroll progress
- [x] Semantic colors consistent (red = high automation exposure, green = human-premium)
- [x] Pull quotes are short paraphrases with attribution
- [x] Methodology (Act 7) honestly labels verified vs. illustrative figures
- [x] Left-edge scroll-progress bar works
