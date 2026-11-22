(() => {
  'use strict';

  const dialog = document.querySelector('[data-lightbox]');
  // Image links still work in browsers without dialog support or JavaScript.
  if (!dialog || typeof dialog.showModal !== 'function') return;

  const image = dialog.querySelector('[data-lightbox-image]');
  const title = dialog.querySelector('[data-lightbox-title]');
  const fullImage = dialog.querySelector('[data-full-image]');

  document.querySelectorAll('[data-artwork]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      image.src = link.href;
      image.alt = link.querySelector('img').alt;
      title.textContent = link.dataset.caption;
      fullImage.href = link.href;
      dialog.showModal();
    });
  });

  dialog.querySelector('[data-close-lightbox]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
})();
