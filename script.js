(() => {
  const grid = document.querySelector('[data-project-grid]');
  const featured = document.querySelector('[data-featured-project]');
  const empty = document.querySelector('[data-empty-projects]');

  const setText = (selector, value) => {
    if (typeof value !== 'string' || !value.trim()) return;
    document.querySelectorAll(selector).forEach((node) => { node.textContent = value; });
  };
  const linkTo = (link, url) => {
    link.href = url;
    if (new URL(url, document.baseURI).origin !== window.location.origin) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
  };
  const makeCard = (project, isFeatured = false) => {
    const article = document.createElement('article');
    article.className = 'project-card' + (isFeatured ? ' project-card--featured' : '');
    const cover = document.createElement(project.url ? 'a' : 'div');
    cover.className = 'project-cover' + (project.coverFit === 'contain' ? ' project-cover--contain' : '');
    if (project.url) {
      linkTo(cover, project.url);
      cover.setAttribute('aria-label', 'Open ' + project.title);
    }
    const source = isFeatured && project.featureCover ? project.featureCover : project.cover;
    if (source) {
      const image = document.createElement('img');
      image.src = source;
      image.alt = project.coverAlt || project.title;
      image.loading = isFeatured ? 'eager' : 'lazy';
      image.decoding = 'async';
      if (isFeatured) image.fetchPriority = 'high';
      const full = isFeatured && project.featureCover;
      const width = full ? project.featureWidth : project.coverWidth;
      const height = full ? project.featureHeight : project.coverHeight;
      if (width && height) { image.width = width; image.height = height; }
      cover.append(image);
    } else {
      const placeholder = document.createElement('span');
      placeholder.className = 'project-placeholder';
      placeholder.textContent = project.mark || project.title.slice(0, 1);
      cover.append(placeholder);
    }
    const caption = document.createElement('div');
    caption.className = 'project-caption';
    const details = document.createElement('div');
    const title = document.createElement(isFeatured ? 'h2' : 'h3');
    title.className = 'project-title';
    if (project.url) {
      const titleLink = document.createElement('a');
      linkTo(titleLink, project.url);
      titleLink.textContent = project.title;
      title.append(titleLink);
    } else title.textContent = project.title;
    details.append(title);
    if (project.description) {
      const description = document.createElement('p');
      description.className = 'project-description';
      description.textContent = project.description;
      details.append(description);
    }
    if (Array.isArray(project.links)) {
      const links = document.createElement('div');
      links.className = 'project-links';
      project.links.forEach((item) => {
        if (!item || !item.label || !item.url) return;
        const link = document.createElement('a');
        linkTo(link, item.url);
        link.textContent = item.label;
        links.append(link);
      });
      details.append(links);
    }
    const meta = document.createElement('span');
    meta.className = 'project-meta';
    meta.textContent = [project.category, project.year].filter(Boolean).join(' · ');
    caption.append(details, meta);
    article.append(cover, caption);
    return article;
  };

  const configReady = window.siteConfig.then((info) => {
    setText('[data-eyebrow]', info.eyebrow);
    setText('[data-intro]', info.intro);
    setText('[data-hero-title]', info.heroTitle || info.design.title);
    setText('[data-hero-emphasis]', info.heroEmphasis || info.design.emphasis);
    setText('[data-about-title]', info.aboutTitle);
    setText('[data-about-title-emphasis]', info.aboutTitleEmphasis);
    if (Array.isArray(info.aboutParagraphs)) {
      const paragraphs = info.aboutParagraphs.filter((text) => typeof text === 'string');
      document.querySelector('[data-about-copy]').replaceChildren(...paragraphs.map((text) => {
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        return paragraph;
      }));
    }
    return info;
  });
  Promise.all([
    configReady,
    fetch('projects.json', { cache: 'no-cache' }).then((response) => {
      if (!response.ok) throw new Error('Could not load projects.json');
      return response.json();
    })
  ]).then(([info, data]) => {
    if (!Array.isArray(data)) throw new Error('projects.json must contain an array');
    const projects = data.filter((project) => project && typeof project.title === 'string' && project.title.trim());
    const selected = projects.find((project) => project.id === (info.featuredProject || info.design.featuredProject))
      || projects.find((project) => project.featured) || projects[0];
    featured.replaceChildren(...(selected ? [makeCard(selected, true)] : []));
    featured.hidden = !selected;
    grid.replaceChildren(...projects.filter((project) => project !== selected).map((project) => makeCard(project)));
    empty.hidden = projects.length > 0;
  }).catch((error) => {
    // Keep the complete HTML gallery usable if the JSON request fails.
    console.info('Using the built-in project collection.', error);
  });
})();
