const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

const root = join(__dirname, '..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const collection = JSON.parse(read('projects.json'));
const themeSource = read('theme.js');
const homeSource = read('script.js');

// A small DOM test double exercises configuration/rendering without browser dependencies.
class Element {
  constructor(tag = 'div') { this.tagName = tag; this.children = []; this.dataset = {}; this.textContent = ''; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(name, value) { this[name] = value; }
}
async function load({ config = {}, projects = collection, source = 'https://example.test/portfolio/theme.js',
  configError, projectsError, loading = false } = {}) {
  const selectors = ['[data-name-full]', '[data-year]', '[data-project-grid]', '[data-featured-project]',
    '[data-empty-projects]', '[data-eyebrow]', '[data-intro]', '[data-hero-title]', '[data-hero-emphasis]',
    '[data-about-title]', '[data-about-title-emphasis]', '[data-about-copy]', 'meta[name="theme-color"]'];
  const nodes = Object.fromEntries(selectors.map((key) => [key, new Element()]));
  nodes['[data-project-grid]'].append('static gallery');
  nodes['[data-featured-project]'].append('static feature');
  const calls = [];
  const listeners = {};
  const document = {
    currentScript: { src: source }, documentElement: new Element('html'),
    baseURI: new URL('index.html', source).href, readyState: loading ? 'loading' : 'complete',
    querySelector: (selector) => nodes[selector],
    querySelectorAll: (selector) => nodes[selector] ? [nodes[selector]] : [],
    createElement: (tag) => new Element(tag),
    addEventListener: (event, handler) => { listeners[event] = handler; }
  };
  const context = vm.createContext({
    document, window: { location: new URL(source) }, URL, Date,
    getComputedStyle: () => ({ getPropertyValue: () => '#faf9f6' }),
    console: { info() {} },
    fetch: async (url, options) => {
      calls.push({ url: String(url), options });
      const isConfig = String(url).endsWith('/site.json');
      const error = isConfig ? configError : projectsError;
      if (error === 'network') throw new Error('offline');
      return { ok: error !== 'http', json: async () => {
        if (error === 'json') throw new SyntaxError('invalid JSON');
        return isConfig ? config : projects;
      } };
    }
  });
  vm.runInContext(themeSource, context);
  const resolved = await context.window.siteConfig;
  if (loading) listeners.DOMContentLoaded();
  vm.runInContext(homeSource, context);
  await new Promise(setImmediate);
  return { nodes, document, resolved, calls };
}
const titleOf = (card) => {
  const heading = card.children[1].children[0].children[0];
  return heading.children[0]?.textContent || heading.textContent;
};

for (const [theme, title] of [
  ['parisian-gallery', 'Opéra Garnier, Paris'],
  ['cobalt-studio', 'House renovation'],
  ['playful-sketchbook', 'June sketchbook'],
  ['midnight-atelier', 'House renovation']
]) {
  test(theme + ' applies its preset and features exactly one project', async () => {
    const { nodes, document } = await load({ config: { theme } });
    assert.equal(document.documentElement.dataset.theme, theme);
    const featured = nodes['[data-featured-project]'].children;
    const cards = nodes['[data-project-grid]'].children;
    assert.equal(featured.length, 1);
    assert.equal(titleOf(featured[0]), title);
    assert.equal(cards.length, collection.length - 1);
    assert.equal(new Set([...featured, ...cards].map(titleOf)).size, collection.length);
    assert.equal(featured[0].children[0].children[0].loading, 'eager');
    assert.ok(cards.every((card) => card.children[0].children[0].loading === 'lazy'));
  });
}
test('invalid configuration and failed requests fall back safely', async () => {
  for (const config of [null, [], 4, {}, { theme: 'missing' }, { theme: '__proto__' }, { theme: {} }]) {
    assert.equal((await load({ config })).resolved.theme, 'parisian-gallery');
  }
  for (const configError of ['network', 'http', 'json']) {
    assert.equal((await load({ configError })).resolved.theme, 'parisian-gallery');
  }
});
test('nested paths fetch the shared configuration and update names after DOM parsing', async () => {
  const { calls, nodes } = await load({
    source: 'https://example.test/a/subdirectory/theme.js', loading: true,
    config: { name: 'Test Artist', theme: 'midnight-atelier' }
  });
  assert.equal(calls[0].url, 'https://example.test/a/subdirectory/site.json');
  assert.equal(calls[0].options.cache, 'no-cache');
  assert.equal(nodes['[data-name-full]'].textContent, 'Test Artist');
  assert.equal(nodes['[data-year]'].textContent, new Date().getFullYear());
});
test('homepage overrides select artwork, full-size cover, and custom copy', async () => {
  const { nodes } = await load({ config: {
    theme: 'cobalt-studio', featuredProject: 'cat-studies', heroTitle: 'My art',
    heroEmphasis: 'My way.', aboutParagraphs: ['One paragraph.', null]
  } });
  const card = nodes['[data-featured-project]'].children[0];
  assert.equal(titleOf(card), 'Cat studies');
  assert.equal(card.children[0].children[0].src, 'assets/drawings/cat-studies.webp');
  assert.equal(nodes['[data-hero-title]'].textContent, 'My art');
  assert.equal(nodes['[data-hero-emphasis]'].textContent, 'My way.');
  assert.equal(nodes['[data-about-copy]'].children.length, 1);
});
test('missing feature IDs fall back to a marked project, then the first project', async () => {
  const config = { featuredProject: 'gone' };
  const first = await load({ config });
  assert.equal(titleOf(first.nodes['[data-featured-project]'].children[0]), 'Opéra Garnier, Paris');
  const second = await load({ config, projects: [{ title: 'Only project' }] });
  assert.equal(titleOf(second.nodes['[data-featured-project]'].children[0]), 'Only project');
});
test('empty collections show the empty state; broken requests preserve the static gallery', async () => {
  const empty = await load({ projects: [] });
  assert.equal(empty.nodes['[data-featured-project]'].hidden, true);
  assert.equal(empty.nodes['[data-empty-projects]'].hidden, false);
  for (const options of [{ projects: {} }, { projectsError: 'network' }, { projectsError: 'json' }, { projectsError: 'http' }]) {
    const { nodes } = await load(options);
    assert.deepEqual(nodes['[data-project-grid]'].children, ['static gallery']);
    assert.deepEqual(nodes['[data-featured-project]'].children, ['static feature']);
  }
});
test('links retain same-tab navigation locally and safe new tabs externally', async () => {
  const { nodes } = await load({ config: { featuredProject: 'house-renovation' } });
  const card = nodes['[data-featured-project]'].children[0];
  const links = card.children[1].children[0].children[2].children;
  assert.equal(card.children[0].target, undefined);
  assert.equal(links[1].target, '_blank');
  assert.equal(links[1].rel, 'noopener noreferrer');
});
test('every page loads the shared tokens and configuration before its behavior', () => {
  for (const path of ['index.html', 'projects/hand-drawn-art.html', 'projects/house-renovation.html', 'course/index.html']) {
    const html = read(path);
    assert.match(html, /data-theme="parisian-gallery"/);
    assert.match(html, /href="(?:\.\.\/)?themes.css\?v=gallery-1"/);
    assert.match(html, /src="(?:\.\.\/)?theme.js\?v=gallery-1"/);
    assert.ok(html.indexOf('themes.css') < html.indexOf('theme.js'));
    assert.ok(html.indexOf('theme.js') < html.indexOf('defer'));
  }
  assert.equal(new Set(collection.map((project) => project.id)).size, collection.length);
});
