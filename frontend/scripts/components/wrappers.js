// Artwork for the four ways a wall can be wrapped.
// `wrapperArt` is the big animated version on the reveal intro (parts are
// classed so reveal.css can animate them open); `wrapperIcon` is the picker icon.

const ART = {
  envelope: `
    <svg class="wrap-art idle" viewBox="0 0 320 260" aria-hidden="true">
      <g class="env-letter"><rect x="70" y="70" width="180" height="150" rx="6" fill="#FFF6EC"/><path d="M92 104h120M92 126h136M92 148h96" stroke="#E2D6C6" stroke-width="6" stroke-linecap="round"/><text x="96" y="196" font-family="Caveat" font-size="30" fill="#C2185B">love, everyone</text></g>
      <rect x="40" y="90" width="240" height="150" rx="12" fill="#FF3D7F"/>
      <path d="M40 240L160 160L280 240Z" fill="#E0306D"/>
      <path class="env-flap" d="M40 92L160 180L280 92Z" fill="#FF6B9A" stroke="#C2185B" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="160" cy="176" r="20" fill="#FFC93C" stroke="#1B1325" stroke-width="3"/>
      <path d="M151 176c3 6 15 6 18 0" stroke="#1B1325" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`,
  gift: `
    <svg class="wrap-art idle" viewBox="0 0 320 260" aria-hidden="true">
      <g class="gift-box"><rect x="70" y="120" width="180" height="130" rx="12" fill="#5B8CFF"/><rect x="146" y="120" width="28" height="130" fill="#FFC93C"/><path d="M70 160h180" stroke="#3F6FE0" stroke-width="4"/></g>
      <g class="gift-lid"><rect x="54" y="88" width="212" height="40" rx="10" fill="#8FB0FF"/><rect x="146" y="88" width="28" height="40" fill="#FFC93C"/><path d="M160 88C120 30 80 50 112 84Z" fill="#FFC93C" stroke="#E0A800" stroke-width="3"/><path d="M160 88C200 30 240 50 208 84Z" fill="#FFC93C" stroke="#E0A800" stroke-width="3"/><circle cx="160" cy="86" r="12" fill="#FFE066" stroke="#E0A800" stroke-width="3"/></g>
    </svg>`,
  mailbox: `
    <svg class="wrap-art idle" viewBox="0 0 320 260" aria-hidden="true">
      <rect x="150" y="190" width="20" height="70" fill="#5A4632"/>
      <path d="M70 110a50 50 0 0 1 100 0V196H70Z" fill="#2DBA7F"/>
      <path d="M120 60H210a50 50 0 0 1 50 50V196H170V110a50 50 0 0 0-50-50Z" fill="#3DDC97"/>
      <g class="mb-door"><path d="M70 110a50 50 0 0 1 100 0V196H70Z" fill="#C9F2C7" stroke="#1B1325" stroke-width="3"/><circle cx="150" cy="150" r="6" fill="#1B1325"/></g>
      <g class="mb-flag-idle"><g class="mb-flag"><path d="M196 120V56" stroke="#1B1325" stroke-width="5" stroke-linecap="round"/><rect x="196" y="56" width="40" height="26" rx="3" fill="#FF3D7F" stroke="#1B1325" stroke-width="3"/></g></g>
    </svg>`,
  cake: `
    <svg class="wrap-art idle" viewBox="0 0 320 260" aria-hidden="true">
      <ellipse cx="160" cy="246" rx="140" ry="12" fill="rgba(255,255,255,.12)"/>
      <rect x="60" y="150" width="200" height="92" rx="14" fill="#FFB3C7"/>
      <rect x="80" y="104" width="160" height="56" rx="12" fill="#FFD3E0"/>
      <path d="M80 118C96 134 108 110 124 126S156 110 172 126S204 110 220 126S236 118 240 118" fill="none" stroke="#FFF" stroke-width="7" stroke-linecap="round"/>
      <path d="M60 168C80 186 96 158 116 176S156 158 176 176S216 158 236 176S256 168 260 168" fill="none" stroke="#FFF" stroke-width="7" stroke-linecap="round"/>
      <rect x="112" y="60" width="10" height="44" rx="3" fill="#B8E1FF"/><rect x="155" y="52" width="10" height="52" rx="3" fill="#FFE066"/><rect x="198" y="60" width="10" height="44" rx="3" fill="#C9F2C7"/>
      <path class="flame" d="M117 30C108 46 112 58 117 58C122 58 126 46 117 30Z" fill="#FFC93C"/>
      <path class="flame" d="M160 22C151 38 155 50 160 50C165 50 169 38 160 22Z" fill="#FFC93C" style="animation-delay:.15s"/>
      <path class="flame" d="M203 30C194 46 198 58 203 58C208 58 212 46 203 30Z" fill="#FFC93C" style="animation-delay:.3s"/>
      <g class="smoke" fill="rgba(255,255,255,.5)"><circle cx="117" cy="40" r="8"/><circle cx="160" cy="32" r="9"/><circle cx="203" cy="40" r="8"/></g>
    </svg>`,
};

const ICONS = {
  envelope: '<svg class="wig" width="64" height="56" viewBox="0 0 64 56" aria-hidden="true"><rect x="4" y="10" width="56" height="40" rx="6" fill="#FF3D7F" stroke="#1B1325" stroke-width="2.5"/><path d="M4 14L32 34L60 14" fill="none" stroke="#1B1325" stroke-width="2.5" stroke-linejoin="round"/><circle cx="32" cy="34" r="6" fill="#FFC93C" stroke="#1B1325" stroke-width="2"/></svg>',
  gift: '<svg class="wig" width="64" height="56" viewBox="0 0 64 56" aria-hidden="true"><rect x="10" y="24" width="44" height="28" rx="4" fill="#5B8CFF" stroke="#1B1325" stroke-width="2.5"/><rect x="6" y="16" width="52" height="10" rx="3" fill="#B8E1FF" stroke="#1B1325" stroke-width="2.5"/><rect x="28" y="16" width="8" height="36" fill="#FFC93C" stroke="#1B1325" stroke-width="2"/><path d="M32 16C22 2 12 8 20 15ZM32 16C42 2 52 8 44 15Z" fill="#FFC93C" stroke="#1B1325" stroke-width="2"/></svg>',
  mailbox: '<svg class="wig" width="64" height="56" viewBox="0 0 64 56" aria-hidden="true"><path d="M10 22a12 12 0 0 1 24 0V44H10Z" fill="#3DDC97" stroke="#1B1325" stroke-width="2.5"/><path d="M22 10H44a12 12 0 0 1 12 12V44H34V22a12 12 0 0 0-12-12Z" fill="#C9F2C7" stroke="#1B1325" stroke-width="2.5"/><rect x="30" y="44" width="6" height="10" fill="#1B1325"/><path d="M36 30V14" stroke="#1B1325" stroke-width="2.5"/><rect x="36" y="14" width="12" height="8" fill="#FF3D7F" stroke="#1B1325" stroke-width="2"/></svg>',
  cake: '<svg class="wig" width="64" height="56" viewBox="0 0 64 56" aria-hidden="true"><rect x="10" y="30" width="44" height="22" rx="4" fill="#FFB3C7" stroke="#1B1325" stroke-width="2.5"/><path d="M10 36C16 42 20 32 26 38S38 32 42 38S50 34 54 38" fill="none" stroke="#FFF" stroke-width="3"/><rect x="22" y="18" width="4" height="12" fill="#B8E1FF" stroke="#1B1325" stroke-width="1.5"/><rect x="38" y="18" width="4" height="12" fill="#B8E1FF" stroke="#1B1325" stroke-width="1.5"/><path class="flame" d="M24 6C20 12 22 16 24 16C26 16 28 12 24 6Z" fill="#FFC93C"/><path class="flame" d="M40 6C36 12 38 16 40 16C42 16 44 12 40 6Z" fill="#FFC93C"/></svg>',
};

export const wrapperArt = (id) => ART[id] || ART.gift;
export const wrapperIcon = (id) => ICONS[id] || ICONS.gift;
