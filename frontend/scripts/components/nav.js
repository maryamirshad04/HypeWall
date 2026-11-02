// Site header. The logo is tentative and lives only here.

export const logo = `
  <a class="logo" href="./" data-link aria-label="HypeWall home">
    <svg width="32" height="32" viewBox="0 0 34 34" aria-hidden="true">
      <rect x="7" y="3" width="22" height="22" rx="4" fill="#FFC93C" transform="rotate(12 18 14)"/>
      <rect x="4" y="8" width="22" height="22" rx="4" fill="#FF3D7F" transform="rotate(-8 15 19)"/>
      <path d="M10 19c2 3 7 3 9 0" stroke="#1B1325" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    </svg>
    <span class="logo-word">hypewall</span>
  </a>`;

export function mainNav() {
  return `
    <header class="nav-wrap">
      <nav class="nav-pill" aria-label="Main">
        ${logo}
        <div class="nav-links">
          <a class="nav-link" href="#how">How it works</a>
          <a class="nav-link" href="#reveals">Reveals</a>
          <a class="nav-link" href="#vibes">Vibes</a>
          <a class="nav-link" href="?page=about" data-link>About</a>
        </div>
        <div class="nav-actions">
          <a class="btn btn-ghost btn-sm" href="?page=join" data-link>Got a code?</a>
          <a class="btn btn-ink btn-sm" href="?page=create" data-link>Start a wall</a>
        </div>
      </nav>
    </header>`;
}

// Compact header for inner pages; `right` is any extra markup for the right side
export function slimNav(right = '<a class="text-link" href="./" data-link>Back home</a>') {
  return `<header class="slim-nav">${logo}<div class="slim-right">${right}</div></header>`;
}
