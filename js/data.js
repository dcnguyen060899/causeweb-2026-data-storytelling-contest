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

// ---------- ACT 4 — Two technologies, two endings (natural experiment) ----------
// CLASSIFICATION: MIXED — see per-series notes below.
// THE CASE:       Two ~10× cost-collapse shocks a generation apart. Both
//                 displaced their skilled workforce. One produced a lasting
//                 artisan premium (painting → Impressionism); one produced
//                 wage collapse (handloom weaving). The difference was the
//                 institutional response, not the technology.
// SERIES "weavers": PATTERN (documented). English handloom cotton weavers'
//                 real weekly wages collapsed by roughly three-quarters as the
//                 power loom diffused, c.1800–1860 (Bythell 1969; Hobsbawm's
//                 oft-cited ~24s → ~6s figure). Direction and rough magnitude
//                 are documented; the smoothed decade index is illustrative of
//                 that well-established collapse.
// SERIES "painters": ILLUSTRATIVE. There is no clean wage index for painters.
//                 The trajectory — sharp mid-century dip as the daguerreotype
//                 (1839) and wet-plate (1851) destroyed the commercial-portrait
//                 trade, then recovery as an authenticity/"fine-art" premium
//                 emerged (Barbizon, then Impressionism from 1874) — is the
//                 author's synthesis of the qualitative historical record
//                 (McCauley 1994; Galenson). NOT a measured series.
// Each series is indexed to 100 at its own first observation so the SHAPES
// are comparable; the levels are not a cross-series wage comparison.
const DATA_TECH_TRANSITIONS = {
  weavers: [
    { year: 1800, wage: 100 },
    { year: 1810, wage:  94 },
    { year: 1820, wage:  74 },
    { year: 1830, wage:  50 },
    { year: 1840, wage:  34 },
    { year: 1850, wage:  26 },
    { year: 1860, wage:  24 }
  ],
  painters: [
    { year: 1820, wage: 100 },
    { year: 1835, wage:  97 },
    { year: 1845, wage:  80 },
    { year: 1855, wage:  64 },
    { year: 1865, wage:  73 },
    { year: 1875, wage:  92 },
    { year: 1890, wage: 118 },
    { year: 1900, wage: 140 }
  ]
};

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
