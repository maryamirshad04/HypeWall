// Bits shared by the board-backed views.

import { slimNav } from '../components/nav.js';
import { esc } from '../lib/dom.js';

export function renderError(root, error) {
  const missing = error.status === 404;
  root.innerHTML = `
    <div class="page grain">
      ${slimNav()}
      <main class="error-state">
        <div>
          <p class="hand" style="font-size:32px;margin:0">${missing ? 'uh oh' : 'hmm'}</p>
          <h1 class="h-lg">${missing ? 'this wall does not exist.' : 'something went sideways.'}</h1>
          <p class="lead">${missing ? 'Double check the link with whoever sent it.' : esc(error.message)}</p>
          <a class="btn btn-ink" href="./" data-link style="margin-top:16px">Go home</a>
        </div>
      </main>
    </div>`;
}
