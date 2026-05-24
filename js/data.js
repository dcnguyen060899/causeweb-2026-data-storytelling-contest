/* ============================================================
   data.js — hard-coded datasets for the scrollytelling piece.

   Every block declares:
     - CLASSIFICATION: how to read the numbers (see categories below)
     - SOURCE: where the underlying real-world pattern comes from
     - NOTE:  what was rounded, smoothed, or synthesized

   Classification categories (matches Act 7 methodology):
     VERIFIED   — the pattern AND magnitudes are real and well-documented
     PATTERN    — the trend/direction is real and well-documented; values rounded
     ILLUSTRATIVE — author's synthesis to communicate qualitative ordering

   No external fetches — fully self-contained.
   ============================================================ */

// ---------- ACT 0 — Cost-per-1M-tokens trajectory ----------
// CLASSIFICATION: PATTERN  (~750× drop is real; yearly values smoothed)
// SOURCE:         Epoch AI tracking + OpenAI / Anthropic / open-weights
//                 provider pricing histories, 2020–2026.
// NOTE:           Values are rounded for narrative clarity. The exact
//                 trajectory varies by model class, but the order-of-
//                 magnitude drop is consistent across providers.
const DATA_COST_CURVE = [
  { year: 2020, cost: 60.00 },
  { year: 2021, cost: 40.00 },
  { year: 2022, cost: 20.00 },
  { year: 2023, cost: 10.00 },
  { year: 2024, cost:  2.50 },
  { year: 2025, cost:  0.30 },
  { year: 2026, cost:  0.08 }
];

// ---------- ACT 1 — Automation exposure by occupation ----------
// CLASSIFICATION: ILLUSTRATIVE
// SOURCE:         Synthesized from task-level analyses (Epoch AI) and
//                 the O*NET task structure for each occupation.
// NOTE:           Numbers communicate the qualitative ordering — generic
//                 cognitive at top, embodied/relational at bottom. They
//                 are NOT point estimates from a single peer-reviewed study.
const DATA_EXPOSURE = [
  { occupation: "Data Entry Clerk",     exposure: 0.92 },
  { occupation: "Paralegal",            exposure: 0.82 },
  { occupation: "Financial Analyst",    exposure: 0.78 },
  { occupation: "Radiologist",          exposure: 0.71 },
  { occupation: "Software Engineer",    exposure: 0.58 },
  { occupation: "Nurse Practitioner",   exposure: 0.31 },
  { occupation: "Therapist",            exposure: 0.22 },
  { occupation: "Elementary Teacher",   exposure: 0.19 },
  { occupation: "Plumber",              exposure: 0.11 },
  { occupation: "Carpenter",            exposure: 0.08 }
];

// ---------- ACT 3 — Wage polarization, 1980–2024 ----------
// CLASSIFICATION: PATTERN  (polarization is one of the most-replicated
//                          findings in U.S. labor economics; indices here
//                          are illustrative of that pattern)
// SOURCE:         BLS Current Population Survey real-earnings series and
//                 the polarization literature (Autor & Dorn 2013;
//                 successor BLS work).
// NOTE:           Index 1980 = 100, inflation-adjusted relative wages.
//                 The shape — rising high, flat low, hollowed middle —
//                 is robust; the exact index values are indicative.
const DATA_WAGE_POLARIZATION = [
  { year: 1980, high_skill: 100, middle_skill: 100, low_skill: 100 },
  { year: 1990, high_skill: 115, middle_skill:  98, low_skill:  96 },
  { year: 2000, high_skill: 138, middle_skill:  95, low_skill:  93 },
  { year: 2010, high_skill: 148, middle_skill:  88, low_skill:  91 },
  { year: 2020, high_skill: 168, middle_skill:  83, low_skill:  95 },
  { year: 2024, high_skill: 182, middle_skill:  79, low_skill:  98 }
];

// ---------- ACT 4 — Baumol cost disease: sector price growth ----------
// CLASSIFICATION: PATTERN  (each direction is well-documented in BLS CPI;
//                          magnitudes are rounded approximations)
// SOURCE:         BLS Consumer Price Index, selected category indices,
//                 cumulative percent change 1990 → 2024.
// NOTE:           Software/electronics have unambiguously fallen; college
//                 tuition, medical care, childcare, and housing have
//                 unambiguously risen. Specific values rounded for the
//                 visual; the directional story is robust.
const DATA_BAUMOL = [
  { sector: "Software",        growth_pct:  -90 },
  { sector: "TVs",             growth_pct:  -96 },
  { sector: "College Tuition", growth_pct:  220 },
  { sector: "Medical Care",    growth_pct:  180 },
  { sector: "Childcare",       growth_pct:  160 },
  { sector: "Housing",         growth_pct:  120 }
];

// ---------- ACT 6 — Scarcity spectrum ----------
// CLASSIFICATION: ILLUSTRATIVE
// SOURCE:         Author's synthesis of task structure across O*NET
//                 categories. The x-axis spans "fully automatable" (0)
//                 to "irreducibly human" (1).
// NOTE:           Bubble positions communicate the spectrum, not a
//                 single-source ranking.
const DATA_SPECTRUM = [
  { label: "Data entry",            x: 0.05, category: "automated"     },
  { label: "Legal research",        x: 0.15, category: "automated"     },
  { label: "Code generation",       x: 0.25, category: "at-risk"       },
  { label: "Financial modeling",    x: 0.30, category: "at-risk"       },
  { label: "Diagnosis support",     x: 0.45, category: "hybrid"        },
  { label: "Teaching",              x: 0.65, category: "human-premium" },
  { label: "Therapy",               x: 0.78, category: "human-premium" },
  { label: "Contextual judgment",   x: 0.85, category: "human-premium" },
  { label: "Trust & presence",      x: 0.95, category: "human-premium" }
];

// ---------- ACT 5 — Jordan's three pillars (label data) ----------
// CLASSIFICATION: VERIFIED  (Jordan's published framework)
// SOURCE:         Jordan (2019) "Artificial Intelligence—The Revolution
//                 Hasn't Happened Yet"; Jordan (2025) "A Collectivist,
//                 Economic Perspective on AI".
const DATA_JORDAN_NODES = [
  { id: "comp", title: "COMPUTING",  sub: "Algorithms · Scale · Gradient descent",   className: "triangle-node-comp" },
  { id: "inf",  title: "INFERENCE",  sub: "Statistics · Uncertainty · Causality",    className: "triangle-node-inf"  },
  { id: "econ", title: "ECONOMICS",  sub: "Incentives · Mechanism design",           className: "triangle-node-econ" }
];
