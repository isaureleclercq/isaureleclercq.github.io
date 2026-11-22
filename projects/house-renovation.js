(() => {
  'use strict';

  const stage = document.querySelector('[data-model-stage]');
  const frame = document.querySelector('[data-model-frame]');
  const poster = document.querySelector('[data-model-poster]');
  const posterLabel = document.querySelector('[data-poster-label]');
  const start = document.querySelector('[data-model-start]');
  const button = document.querySelector('[data-load-model]');
  const status = document.querySelector('[data-model-status]');
  let loadingTimer;
  const smallScreen = window.matchMedia('(max-width: 600px)');

  start.hidden = false;
  status.textContent = 'Select “Explore in 3D” to open the interactive model.';

  const updateScreenMode = () => {
    if (smallScreen.matches) {
      window.clearTimeout(loadingTimer);
      frame.removeAttribute('src');
      frame.hidden = true;
      poster.hidden = false;
      posterLabel.hidden = false;
      start.hidden = false;
      stage.setAttribute('aria-busy', 'false');
      status.textContent = 'Open the model in Autodesk for a full-page 3D view.';
    } else if (frame.hidden) {
      status.textContent = 'Select “Explore in 3D” to open the interactive model.';
    }
  };
  smallScreen.addEventListener('change', updateScreenMode);
  updateScreenMode();

  button.addEventListener('click', () => {
    start.hidden = true;
    poster.hidden = true;
    posterLabel.hidden = true;
    stage.setAttribute('aria-busy', 'true');
    status.textContent = 'Opening the Autodesk viewer… Large models can take a moment.';

    // The frame load event confirms the viewer page opened, not that its
    // cross-origin 3D model finished rendering. Keep the source link available.
    frame.addEventListener('load', () => {
      if (!frame.hasAttribute('src')) return;
      window.clearTimeout(loadingTimer);
      stage.setAttribute('aria-busy', 'false');
      status.textContent = 'Autodesk viewer opened. The model may take a moment to render.';
    }, { once: true });

    frame.addEventListener('error', () => {
      if (!frame.hasAttribute('src')) return;
      window.clearTimeout(loadingTimer);
      stage.setAttribute('aria-busy', 'false');
      status.textContent = 'The embedded viewer could not open. Use “Open in Autodesk” to view the model.';
    }, { once: true });

    loadingTimer = window.setTimeout(() => {
      stage.setAttribute('aria-busy', 'false');
      status.textContent = 'The viewer is taking longer than expected. You can also use “Open in Autodesk” below.';
    }, 20000);

    frame.src = frame.dataset.src;
    frame.hidden = false;
    frame.focus();
  });
})();
