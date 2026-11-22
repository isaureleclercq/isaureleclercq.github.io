const projectGrid = document.querySelector('[data-project-grid]');
const emptyProjects = document.querySelector('[data-empty-projects]');

const setText = (selector, value) => {
  if (!value) return;
  document.querySelectorAll(selector).forEach((node) => { node.textContent = value; });
};

const configureProjectLink = (link, url) => {
  link.href = url;
  const isExternal = new URL(url, document.baseURI).origin !== window.location.origin;
  if (isExternal) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  return isExternal;
};

const makeProjectCard = (project, index) => {
  const article = document.createElement('article');
  article.className = 'project-card';
  if (project.featured) article.classList.add('project-card--featured');

  const cover = document.createElement(project.url ? 'a' : 'div');
  cover.className = 'project-cover';
  if (project.coverFit === 'contain') cover.classList.add('project-cover--contain');
  if (project.url) {
    configureProjectLink(cover, project.url);
    cover.setAttribute('aria-label', `Open ${project.title}`);
  }

  if (project.cover) {
    const image = document.createElement('img');
    image.src = project.cover;
    image.alt = project.coverAlt || `${project.title} project image`;
    image.loading = 'lazy';
    image.decoding = 'async';
    if (project.coverWidth && project.coverHeight) {
      image.width = project.coverWidth;
      image.height = project.coverHeight;
    }
    cover.append(image);
  } else {
    const placeholder = document.createElement('span');
    placeholder.className = 'project-placeholder';
    placeholder.style.setProperty('--cover', project.color || '#e4e6da');
    const mark = document.createElement('span');
    mark.className = 'placeholder-mark';
    mark.textContent = project.mark || project.title.slice(0, 1);
    placeholder.append(mark);
    cover.append(placeholder);
  }

  const indexLabel = document.createElement('span');
  indexLabel.className = 'cover-index';
  indexLabel.textContent = String(index + 1).padStart(2, '0');
  const arrow = document.createElement('span');
  arrow.className = 'cover-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = project.url ? '↗' : '✳';
  cover.append(indexLabel, arrow);

  const caption = document.createElement('div');
  caption.className = 'project-caption';
  const details = document.createElement('div');
  const title = document.createElement('h3');
  title.className = 'project-title';
  if (project.url) {
    const titleLink = document.createElement('a');
    configureProjectLink(titleLink, project.url);
    titleLink.textContent = project.title;
    title.append(titleLink);
  } else {
    title.textContent = project.title;
  }
  details.append(title);
  if (project.description) {
    const description = document.createElement('p');
    description.className = 'project-description';
    description.textContent = project.description;
    details.append(description);
  }
  if (Array.isArray(project.links) && project.links.length) {
    const links = document.createElement('div');
    links.className = 'project-links';
    project.links.forEach((item) => {
      if (!item.label || !item.url) return;
      const link = document.createElement('a');
      const isExternal = configureProjectLink(link, item.url);
      link.textContent = `${item.label} ${isExternal ? '↗' : '→'}`;
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

const renderProjects = (projects) => {
  projectGrid.replaceChildren(...projects.map(makeProjectCard));
  emptyProjects.hidden = projects.length > 0;
  document.querySelectorAll('[data-project-count]').forEach((node) => {
    node.textContent = String(projects.length).padStart(2, '0');
  });
};

const loadSiteInfo = async () => {
  try {
    const response = await fetch('site.json');
    if (!response.ok) throw new Error('Could not load site.json');
    const info = await response.json();
    setText('[data-name-full]', info.name);
    setText('[data-name-short]', info.shortName || info.name?.split(' ')[0]);
    setText('[data-first-name]', info.firstName || info.name?.split(' ')[0]);
    setText('[data-eyebrow]', info.eyebrow);
    setText('[data-intro]', info.intro);
    setText('[data-about-title]', info.aboutTitle);
    setText('[data-about-title-emphasis]', info.aboutTitleEmphasis);
    if (Array.isArray(info.aboutParagraphs)) {
      const copy = document.querySelector('[data-about-copy]');
      copy.replaceChildren(...info.aboutParagraphs.map((text) => {
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        return paragraph;
      }));
    }
  } catch (error) {
    console.info('Using the built-in introduction.', error);
  }
};

const loadProjects = async () => {
  try {
    const response = await fetch('projects.json');
    if (!response.ok) throw new Error('Could not load projects.json');
    const projects = await response.json();
    renderProjects(Array.isArray(projects) ? projects : []);
  } catch (error) {
    console.info('Project list is not available yet.', error);
    renderProjects([]);
  }
};

document.querySelectorAll('[data-year]').forEach((node) => {
  node.textContent = new Date().getFullYear();
});
loadSiteInfo();
loadProjects();
