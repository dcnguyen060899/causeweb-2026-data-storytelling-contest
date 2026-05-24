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
- [x] D3 and Scrollama self-hosted under `js/vendor/` (no CDN dependency)
- [x] Dial pointer-listener leak on resize fixed (clone-and-replace knob element)
- [x] Wage polarization low-skill dashed line restored after reveal animation
- [x] Act 6 "78% misclassification" copy corrected to "above random chance"
