(() => {
  'use strict';
  const storageKey = 'isaure-web-course-v1';
  const lessonIds = Array.from(document.querySelectorAll('[data-lesson]'), page => page.id);
  let state = { completed: [], checks: {}, lastLesson: lessonIds[0] };
  let storageAvailable = true;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved && typeof saved === 'object') {
      state.completed = Array.isArray(saved.completed) ? saved.completed.filter(id => lessonIds.includes(id)) : [];
      state.checks = saved.checks && typeof saved.checks === 'object' && !Array.isArray(saved.checks) ? saved.checks : {};
      state.lastLesson = lessonIds.includes(saved.lastLesson) ? saved.lastLesson : lessonIds[0];
      if (typeof saved.html === 'string') state.html = saved.html;
      if (typeof saved.css === 'string') state.css = saved.css;
    }
  } catch { storageAvailable = false; }

  const storageNote = document.querySelector('[data-storage-note]');
  const updateStorageNote = () => {
    storageNote.textContent = storageAvailable
      ? 'Progress stays in this browser. No account needed.'
      : 'Browser storage is unavailable. Progress lasts for this visit.';
  };
  const save = () => {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); }
    catch { storageAvailable = false; }
    updateStorageNote();
  };

  const updateProgress = () => {
    const count = new Set(state.completed).size;
    document.querySelector('[data-progress]').value = count;
    document.querySelector('[data-progress-count]').textContent = `${count} / ${lessonIds.length}`;
    document.querySelectorAll('.lesson-link').forEach(link => {
      const done = state.completed.includes(link.hash.slice(1));
      link.classList.toggle('is-complete', done);
      link.querySelector('[data-complete-label]').textContent = done ? ' — completed' : '';
    });
    document.querySelectorAll('[data-complete]').forEach(button => {
      const done = state.completed.includes(button.dataset.complete);
      button.setAttribute('aria-pressed', String(done));
      button.textContent = done ? '✓ Lesson complete' : 'Mark lesson complete';
    });
    const resume = document.querySelector('[data-resume]');
    resume.href = `#${state.lastLesson}`;
    resume.querySelector('span').textContent = count === 8 ? 'Revisit the lessons' : (state.lastLesson !== lessonIds[0] || count > 0 ? 'Continue learning' : 'Start the first lesson');
    document.querySelector('[data-overall-message]').textContent = count === lessonIds.length
      ? 'All eight lessons complete. Your next chapter: make the portfolio your own.'
      : 'Build something small. Make it yours. Keep going.';
  };

  const menu = document.querySelector('[data-menu]');
  const sidebar = document.querySelector('#course-navigation');
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    sidebar.classList.toggle('is-open', open);
  });
  const showPage = (moveFocus = false) => {
    const id = location.hash.slice(1) || 'overview';
    const target = document.getElementById(id);
    const current = target?.classList.contains('page') ? target : document.getElementById('overview');
    document.querySelectorAll('.page').forEach(page => { page.hidden = page !== current; });
    document.querySelectorAll('[data-page-link]').forEach(link => {
      if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.querySelector('[data-breadcrumb]').textContent = current.dataset.title;
    document.title = `${current.dataset.title} — Build your corner of the web`;
    if (lessonIds.includes(current.id)) { state.lastLesson = current.id; save(); }
    sidebar.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
    updateProgress();
    if (moveFocus) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      current.querySelector('h1').focus({ preventScroll: true });
    }
  };
  window.addEventListener('hashchange', () => showPage(true));
  document.querySelector('.skip').addEventListener('click', event => {
    event.preventDefault();
    document.querySelector('.page:not([hidden]) h1').focus();
  });

  document.querySelectorAll('[data-check]').forEach(input => {
    input.checked = state.checks[input.dataset.check] === true;
    input.addEventListener('change', () => { state.checks[input.dataset.check] = input.checked; save(); });
  });
  document.querySelectorAll('[data-complete]').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.complete;
      if (state.completed.includes(id)) state.completed = state.completed.filter(item => item !== id);
      else state.completed.push(id);
      save();
      updateProgress();
      document.getElementById(`${id}-message`).textContent = state.completed.includes(id)
        ? 'Lesson marked complete. You can revisit any lesson whenever you like.'
        : 'Lesson marked as in progress.';
    });
  });
  document.querySelectorAll('[data-quiz]').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const selected = form.querySelector('input:checked');
      const feedback = form.querySelector('[data-feedback]');
      if (!selected) {
        feedback.textContent = 'Choose an answer first, then check it.';
        feedback.dataset.result = 'incorrect';
        return;
      }
      const correct = selected.value === form.dataset.answer;
      feedback.dataset.result = correct ? 'correct' : 'incorrect';
      feedback.textContent = correct ? `Exactly. ${form.dataset.explanation}` : `Not quite. ${form.dataset.explanation} Try another answer.`;
    });
    form.addEventListener('change', () => { form.querySelector('[data-feedback]').textContent = ''; });
  });
  document.querySelectorAll('.code-block').forEach(block => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-button';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', `Copy ${block.querySelector('.code-top').textContent.trim()} example`);
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(block.querySelector('code').textContent);
        button.textContent = 'Copied ✓';
      } catch { button.textContent = 'Select code to copy'; }
      window.setTimeout(() => { button.textContent = 'Copy'; }, 2500);
    });
    block.querySelector('.code-top').append(button);
  });

  const htmlEditor = document.querySelector('#html-editor');
  const cssEditor = document.querySelector('#css-editor');
  const originalHTML = htmlEditor.value;
  const originalCSS = cssEditor.value;
  if (typeof state.html === 'string') htmlEditor.value = state.html;
  if (typeof state.css === 'string') cssEditor.value = state.css;
  const preview = document.querySelector('#workbench-preview');
  const previewStatus = document.querySelector('[data-preview-status]');
  const runPreview = (announce = true) => {
    // An opaque-origin, script-free frame keeps experiments separate from the course.
    // CSP also blocks remote requests, forms, and nested frames in pasted HTML.
    const safeCSS = cssEditor.value.replace(/<\/style/gi, '<\\/style');
    preview.srcdoc = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src 'none'; form-action 'none'; base-uri 'none';"><style>${safeCSS}</style></head><body>${htmlEditor.value}</body></html>`;
    if (announce) previewStatus.textContent = 'Preview updated. Your code is saved in this browser when storage is available.';
  };
  [htmlEditor, cssEditor].forEach(editor => {
    editor.addEventListener('input', () => {
      state.html = htmlEditor.value;
      state.css = cssEditor.value;
      save();
      previewStatus.textContent = 'Changes ready. Select Run preview to see them.';
    });
  });
  document.querySelector('[data-run]').addEventListener('click', () => runPreview());
  document.querySelector('[data-reset-code]').addEventListener('click', () => {
    htmlEditor.value = originalHTML;
    cssEditor.value = originalCSS;
    state.html = originalHTML;
    state.css = originalCSS;
    save();
    runPreview(false);
    previewStatus.textContent = 'The original example has been restored.';
  });

  document.body.classList.add('js-enabled');
  updateStorageNote();
  showPage();
  runPreview(false);
})();
