// A field people never see or fill in. Bots that auto-fill every input do,
// and the backend rejects any request where it has a value.

export const honeypotField = `
  <div class="hp" aria-hidden="true">
    <label>Leave this empty <input type="text" name="website" tabindex="-1" autocomplete="off"></label>
  </div>`;

export const honeypotValue = (form) => form.elements.website?.value || '';
