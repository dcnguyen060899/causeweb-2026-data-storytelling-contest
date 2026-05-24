/* utils.js — shared helpers, locked to the ink + accent palette. */

const COLORS = {
  paper:    '#F4F1EA',
  paper2:   '#ECE8DE',
  ink:      '#1A1A18',
  inkSoft:  '#5A5A52',
  inkFaint: '#A8A59C',
  accent:   '#C8442A'
};

const fmtMoney = (v) => {
  if (v >= 10) return '$' + v.toFixed(0) + '.00';
  if (v >= 1)  return '$' + v.toFixed(2);
  return '$' + v.toFixed(2);
};

const fmtPct = (v) => (v > 0 ? '+' : '') + v + '%';

function getSvgBox(svgEl, defaultHeight = 360) {
  const w = svgEl.parentElement.clientWidth || 500;
  return { width: w, height: defaultHeight };
}

const easeOut = d3.easeCubicOut;
