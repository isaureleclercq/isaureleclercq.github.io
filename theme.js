/* Shared by every page; paths resolve from here, including on GitHub Pages. */
(() => {
  const presets = Object.freeze({
    'parisian-gallery': { title: 'Art &', emphasis: 'architecture.', featuredProject: 'opera-garnier' },
    'cobalt-studio': { title: 'Art, code &', emphasis: 'design.', featuredProject: 'house-renovation' },
    'playful-sketchbook': { title: 'A sketchbook', emphasis: '& portfolio.', featuredProject: 'june-sketchbook' },
    'midnight-atelier': { title: 'Architecture', emphasis: '& drawing.', featuredProject: 'house-renovation' }
  });
  const configURL = new URL('site.json', document.currentScript.src);
  const applyConfig = (value) => {
    const config = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const theme = typeof config.theme === 'string' && Object.hasOwn(presets, config.theme)
      ? config.theme : 'parisian-gallery';
    document.documentElement.dataset.theme = theme;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim();
    const updateSharedContent = () => {
      if (typeof config.name === 'string' && config.name.trim()) {
        document.querySelectorAll('[data-name-full]').forEach((node) => { node.textContent = config.name; });
      }
      document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', updateSharedContent, { once: true });
    else updateSharedContent();
    return { ...config, theme, design: presets[theme] };
  };
  window.siteConfig = fetch(configURL, { cache: 'no-cache' })
    .then((response) => {
      if (!response.ok) throw new Error('Could not load site.json');
      return response.json();
    })
    .then(applyConfig)
    .catch((error) => {
      console.info('Using the default Parisian Gallery design.', error);
      return applyConfig({});
    });
})();
