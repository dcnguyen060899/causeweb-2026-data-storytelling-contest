# Will AI Make Human Work Worthless — or Priceless?

A scrollytelling piece submitted to the **[CAUSE Student Data Scrollytelling Contest](https://causeweb.org/cause/contests/data-scrollytelling)** (Spring 2026).

**Live site:** https://cheap-as-electricity.com  
**GitHub Pages mirror:** https://dcnguyen060899.github.io/causeweb-2026-data-storytelling-contest/

> **Blind review:** This artifact intentionally contains no author identification anywhere in the page, code comments, or meta tags. Author identity is supplied separately on the submission form.

---

## The argument

As AI commoditizes generic cognitive work, the parts of human labor that *cannot* be automated become scarcer — and therefore more valuable. Doom and Utopia are not rival forecasts; they describe different phases of the same process. Which phase dominates, and for whom, depends on two measurable dials: how interchangeable AI and human output are to buyers, and how much AI expands production rather than just replacing workers.

Frameworks drawn from: Jordan (2019, 2025), Autor & Dorn (2013), Acemoglu-Restrepo, Baumol cost disease.

---

## Stack

Vanilla HTML + [Scrollama.js 3](https://github.com/russellsamora/scrollama) + [D3.js v7](https://d3js.org). No build step, no framework, no external data fetches.

| Scroll pattern | Used in |
|---|---|
| `onStepProgress` (continuous) | Act 0 (cost counter), Act 4 (sign-flip playhead) |
| `onStepEnter` (discrete) | Acts 1, 2, 3, 6, 7 |
| User-driven (no scroll) | Act 5 (two-dial widget) |

---

## Argument structure

| Act | Title | Narrative role |
|-----|-------|----------------|
| 0 | Hero / Cost Collapse | Hook — $60 → $0.08 per million tokens, 2020–2026 |
| 1 | The Two Camps | Establishes the doom-vs-utopia false binary |
| 2 | The Shock | Which occupations face the highest exposure, and why |
| 3 | The Short-Run Squeeze | Displacement effect — wage polarization 1980–2024 |
| 4 | The Long-Run Rebound | Sign flip — Baumol + human-touch premium |
| 5 | The Two Dials | Interactive — substitution vs. augmentation |
| 6 | The Jordan Layer | Why incentives and rules decide who actually gains |
| 7 | The Spectrum & Close | Full picture; closing callback to opening thesis |
| 8 | Methodology & Sources | Verified / pattern / illustrative classifications; references |

---

## File structure

```
scrollytelling/
├── index.html                    single entry point
├── CNAME                         custom domain (cheap-as-electricity.com)
├── css/
│   └── style.css                 full design system (palette, typography, layout, responsive)
├── js/
│   ├── main.js                   scrollama setup + act orchestration
│   ├── data.js                   all hard-coded datasets with CLASSIFICATION notes
│   ├── utils.js                  shared helpers (color tokens, formatters, SVG sizing)
│   └── charts/
│       ├── costCurve.js          Act 0 — animated counter, progress-driven
│       ├── twoCamps.js           Act 1 — doom-vs-utopia split-screen
│       ├── exposureChart.js      Act 2 — 200-worker pictogram per occupation
│       ├── wagePolarization.js   Act 3 — wage polarization line chart
│       ├── signFlipTimeline.js   Act 4 — sign-flip playhead, progress-driven
│       ├── baumolChart.js        Act 4 — sector price-change bars
│       ├── twoDials.js           Act 5 — draggable two-dial widget
│       ├── jordanTriangle.js     Act 6 — Jordan SVG triangle + drug-approval flowchart
│       └── spectrumViz.js        Act 7 — scarcity-spectrum bubble chart
└── README.md
```

---

## Data integrity

Every dataset in `js/data.js` carries a `CLASSIFICATION` comment:

| Label | Meaning |
|-------|---------|
| `VERIFIED` | Published figure reproduced accurately |
| `PATTERN` | Real trend; exact values rounded for narrative clarity |
| `ILLUSTRATIVE` | Author's synthesis; qualitative ordering is grounded in cited sources |

The same classification appears in Act 8 of the page itself so readers see exactly what is and is not a point estimate.

**Audit result (May 2026):** All five primary datasets pass completeness, plausibility, citation, and cross-dataset consistency checks. One redundancy: `DATA_JORDAN_NODES` in `data.js` is defined but unused — `jordanTriangle.js` hardcodes identical data locally.

**External statistics used in-page (not in data.js):**

| Stat | Source | Classification note |
|------|--------|---------------------|
| 42% of consumers prefer human-made goods | Kinsta/Propeller Insights 2025 (n=1,011) | Vendor-sponsored; disclosed |
| 17% handmade price premium | Fuchs et al. 2015, *Journal of Marketing* 79(2) | Lab experiment |
| 78% AI-image misclassification rate | Frank et al., IEEE S&P 2024 (n=3,002) | 2022 data → conservative floor |
| 41% employers plan headcount reduction | WEF Future of Jobs 2025 (1,000+ employers) | Intent, not realized change; tension with +78M net figure disclosed |

---

## Run locally

```bash
cd scrollytelling/
python3 -m http.server 8765
# open http://localhost:8765
```

Opening `index.html` directly via `file://` works in most browsers, but serving over HTTP avoids a few CDN/CORS edge cases.

---

## Known issues (post-audit, pre-submission)

These were surfaced by a multi-agent code + judge + data review and are in-progress fixes:

1. **[HIGH] CDN dependency risk** — D3 and Scrollama are loaded from jsDelivr/unpkg without SRI hashes. If either CDN is unreachable, all charts fail silently. Fix: self-host both libraries under `js/vendor/` or add `integrity`/`crossorigin` attributes.

2. **[HIGH] Dial pointer-listener leak on resize** — `twoDials.js` re-attaches `pointerdown/move/up` listeners each time `setup()` runs without removing prior ones. After N resize events, each pointer event fires N handlers, making drag erratic on mobile (where resize fires on address-bar toggle). Fix: clone-and-replace the knob element before attaching handlers, or guard with a `removeEventListener` cleanup step.

3. **[MEDIUM] Low-skill dashed line lost after reveal animation** — `wagePolarization.js:77-84` sets `stroke-dasharray: '4 3'` then immediately overwrites it with the draw-on animation stroke offsets. The line renders as solid after the animation completes, contradicting the prose ("the dashed gray line"). Fix: restore `stroke-dasharray` at the end of the transition.

4. **[MEDIUM] Act 6 — "78% / below random chance" contradiction** — The on-page text reads "78% of people misclassify AI-generated images as human-made … below random chance." 78% is *above* a 50% baseline; number and words disagree. Fix: correct the gloss to "above chance" or adjust the framing.

5. **[MEDIUM] `signFlipTimeline` state not reset after resize** — Module-scope `currentT` persists across `setup()` calls; paths are re-created at full `dashoffset` but `currentT > 0`, causing a momentary blank centerpiece after resize while Act 4 is on-screen. Fix: call `applyVisuals()` at the end of `setup()` when `currentT > 0`.

---

## Judge scorecard (pre-submission review)

| Criterion | Score | Note |
|-----------|-------|------|
| Compelling narrative | 4 / 5 | Strong spine; Act 6 detour competes with the ending |
| Sound data interpretation | 3.5 / 5 | Exemplary labeling discipline; pulled down by the 78% contradiction |
| Effective scrollytelling | 4 / 5 | Sign-flip playhead and dials do real narrative work; other acts are enter-and-draw |
| Visual polish | 4.5 / 5 | Disciplined five-token palette, considered typography, near-professional |
| **Overall** | **16 / 20** | Competitive; fixing items 2 and 4 above targets 17.5–18 |

---

## Quality checklist

- [x] No author / institution / handle identifiers anywhere in the artifact, repo config, or meta tags
- [x] All economics terms glossed in plain language at first use (equilibrium, Baumol, displacement)
- [x] All 9 acts render in Chrome and Firefox
- [x] All chart animations trigger on scroll, not on page load
- [x] Mobile layout works at 375px viewport
- [x] No console errors
- [x] `history.scrollRestoration = 'manual'` prevents mid-page refresh snap
- [x] Cost counter animates continuously $60.00 → $0.08 (progress-driven, no steps)
- [x] Sign-flip playhead recolors continuously with scroll progress
- [x] Dial drag works on touch and pointer devices (44 px touch targets)
- [x] Semantic color usage: red = high automation risk, green = human-premium
- [x] Methodology act labels every figure as verified / pattern / illustrative
- [x] Left-edge scroll-progress bar tracks reading position
- [x] All datasets cited with source, year, and methodology caveat where relevant
- [ ] D3 + Scrollama self-hosted or SRI-pinned (CDN fallback risk — see Known Issues #1)
- [ ] Dial listener leak on resize fixed (see Known Issues #2)
- [ ] Wage polarization dashed line restored (see Known Issues #3)
- [ ] Act 6 "78% / below random chance" contradiction resolved (see Known Issues #4)
