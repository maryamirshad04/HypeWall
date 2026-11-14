// Small looping previews of each reveal style (landing cards + create preview).

const DEMOS = {
  solitaire: () => {
    const trail = [['#FFE066', 0, 1], ['#FFE066', -0.12, 0.75], ['#FFE066', -0.24, 0.5], ['#FFB3C7', -1.4, 1], ['#FFB3C7', -1.52, 0.75], ['#FFB3C7', -1.64, 0.5]];
    return `<div class="stage" style="background:#136F4B">${trail
      .map(([c, d, o], i) => `<div class="sx" style="animation-delay:${d}s;opacity:${o}"><div class="sy" style="animation-delay:${i < 3 ? d : d + 1}s"><div class="mini" style="background:${c}"></div></div></div>`)
      .join('')}</div>`;
  },
  deal: () => {
    const colors = ['#FFE066', '#B8E1FF', '#FFB3C7', '#C9F2C7', '#E3D1FF', '#FFD3A8', '#FFE066', '#B8E1FF'];
    return `<div class="stage stage-grid" style="background:#3B1F4F">${colors
      .map((c, i) => `<div class="demo-deal" style="--fx:${[120, 60, -10, -80][i % 4]}px;--fy:${i < 4 ? 120 : 50}px;animation-delay:${(i * 0.15).toFixed(2)}s;background:${c}"></div>`)
      .join('')}</div>`;
  },
  flash: () => {
    const spots = [[12, 16, '#FF3D7F'], [42, 52, '#FFC93C'], [70, 20, '#5B8CFF'], [24, 62, '#3DDC97'], [82, 62, '#E3D1FF']];
    return `<div class="stage" style="background:#0D0A12">${spots
      .map(([l, t, c], i) => `<div class="mini demo-flash" style="left:${l}%;top:${t}%;background:${c};animation-delay:${i * 0.25}s"></div>`)
      .join('')}</div>`;
  },
  rain: () => {
    const drops = [[8, 63, '#FFE066'], [26, 67, '#FFB3C7'], [44, 61, '#C9F2C7'], [62, 65, '#FFD3A8'], [80, 62, '#E3D1FF'], [17, 35, '#B8E1FF'], [55, 32, '#FFE066']];
    return `<div class="stage" style="background:#1F3A6B">${drops
      .map(([l, t, c], i) => `<div class="mini demo-rain" style="left:${l}%;top:${t}%;background:${c};animation-delay:${(i * 0.2).toFixed(1)}s"></div>`)
      .join('')}</div>`;
  },
  letter: () => `<div class="stage stage-letter" style="background:#2B2118"><div class="demo-type" style="color:#FFE066;max-width:300px">dear amna, you are the best</div><div class="demo-type" style="color:#FFB3C7;max-width:240px;animation-delay:.7s">love, the whole class</div></div>`,
  polaroid: () => {
    const prints = [['-6deg', '#FF3D7F,#FFC93C', 0], ['4deg', '#5B8CFF,#3DDC97', 0.4], ['-2deg', '#8E5CFF,#FFB3C7', 0.8]];
    return `<div class="stage stage-row" style="background:#F2E8DA">${prints
      .map(([r, g, d]) => `<div class="demo-dev" style="transform:rotate(${r});animation-delay:${d}s"><div style="background:linear-gradient(135deg,${g})"></div></div>`)
      .join('')}</div>`;
  },
};

export const revealDemo = (id) => (DEMOS[id] || DEMOS.solitaire)();
