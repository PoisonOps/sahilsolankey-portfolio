/* form.js — idea form → WhatsApp submission */
'use strict';

(function () {

  function init() {
    const form    = document.getElementById('idea-form-el');
    const success = document.getElementById('form-success');
    const ideaEl  = document.getElementById('field-idea');
    const whoEl   = document.getElementById('field-who');
    const nameEl  = document.getElementById('field-name');
    const errEl   = document.getElementById('idea-error');

    if (!form) return;

    /* Key-tap sound (throttled 90ms) */
    let lastKeySound = 0;
    [ideaEl, whoEl, nameEl].forEach(input => {
      if (!input) return;
      input.addEventListener('keydown', () => {
        const now = Date.now();
        if (now - lastKeySound < 90) return;
        lastKeySound = now;
        if (window.Sound?.playKey) window.Sound.playKey();
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();

      const idea = ideaEl?.value?.trim() || '';
      const who  = whoEl?.value?.trim()  || '';
      const name = nameEl?.value?.trim() || '';

      /* Validate — inline, no alert() */
      if (!idea) {
        errEl?.classList.add('visible');
        ideaEl?.focus();
        return;
      }

      errEl?.classList.remove('visible');

      /* Build WhatsApp message */
      const msg = `Hi Sahil! I have a product idea.\n\nIdea: ${idea}\nWho it's for: ${who || 'Not specified'}\nName: ${name || 'Not specified'}\n\nCan you tell me what it would take to build?`;

      window.open(
        'https://wa.me/917080442040?text=' + encodeURIComponent(msg),
        '_blank',
        'noopener'
      );

      /* Show success */
      form.style.display = 'none';
      if (success) success.classList.add('visible');

      /* Play ping if sound is on */
      if (window.Sound?.playPing) window.Sound.playPing();
    });

    /* Clear error on input */
    ideaEl?.addEventListener('input', () => errEl?.classList.remove('visible'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
